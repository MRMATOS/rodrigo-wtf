# Mapa do Sossego — Plano de Implementação

App de mapeamento colaborativo de ruído urbano.
Vive em `/ferramentas/mapa-do-sossego` dentro do rodrigo-wtf.

---

## Estrutura de Arquivos Final

```
src/app/ferramentas/
├── page.tsx                          # Vitrine de ferramentas
└── mapa-do-sossego/
    ├── layout.tsx                    # Layout fullscreen (sem Navbar/Footer)
    ├── page.tsx                      # Entry point (SSR shell)
    ├── _components/
    │   ├── MapClient.tsx             # Mapbox GL JS (dynamic import, 'use client')
    │   ├── HeatmapLayer.tsx          # Layer de heatmap
    │   ├── PolylinesLayer.tsx        # Layer de polylines por trecho
    │   ├── AuditMode.tsx             # Modo Auditor (Strava do Sossego)
    │   ├── AuditControls.tsx         # 3 botões gigantes
    │   └── ReportButton.tsx          # Reporte pontual
    └── _lib/
        ├── supabase-noise.ts         # Queries específicas do mapa
        └── map-matching.ts           # Wrapper Mapbox Map Matching API
```

```
supabase/
├── migrations/
│   └── 001_noise_schema.sql         # PostGIS + tabelas + RLS
└── functions/
    └── validate-noise-report/
        └── index.ts                  # Edge Function geofencing
```

---

## Fases

### Fase 1 — Fundação e Rotas
**O quê:** Estrutura mínima que desbloqueia o botão da home e habilita desenvolvimento incremental.

- [ ] Instalar `mapbox-gl` e `@types/mapbox-gl`
- [ ] Criar `/ferramentas/page.tsx` — vitrine com card do Mapa do Sossego (status: "Beta Fechado")
- [ ] Criar `/ferramentas/mapa-do-sossego/layout.tsx` — fullscreen, sem Navbar/Footer do site principal, mas com botão de voltar
- [ ] Ativar o botão "Veja as ferramentas" na `page.tsx` da home (remover `disabled` + `opacity-50`)
- [ ] Adicionar variável de ambiente: `NEXT_PUBLIC_MAPBOX_TOKEN`

---

### Fase 2 — Schema Supabase + PostGIS
**O quê:** Banco de dados espacial. Tudo depende disso.

```sql
-- Habilitar extensão
CREATE EXTENSION IF NOT EXISTS postgis;

-- Segmentos de rua auditados (polylines)
CREATE TABLE noise_segments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geom        GEOMETRY(LINESTRING, 4326) NOT NULL,  -- traçado snapped-to-road
  noise_type  TEXT NOT NULL,  -- 'loud' | 'risk' | 'peaceful'
  intensity   INT DEFAULT 1,  -- peso para o heatmap
  audited_at  TIMESTAMPTZ DEFAULT NOW(),
  session_id  UUID NOT NULL   -- agrupa segmentos de uma sessão de auditoria
);

-- Índice espacial (mandatório para performance)
CREATE INDEX noise_segments_geom_idx ON noise_segments USING GIST(geom);

-- Reportes pontuais
CREATE TABLE noise_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geom        GEOMETRY(POINT, 4326) NOT NULL,
  noise_type  TEXT NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX noise_reports_geom_idx ON noise_reports USING GIST(geom);
```

**RLS:** tabelas são read-only para `anon`. Write exige passar pela Edge Function — nunca direto do client.

---

### Fase 3 — Mapa Base
**O quê:** Mapa funcional com dados reais, sem interação ainda.

- `MapClient.tsx` com `dynamic(() => import(...), { ssr: false })`
- Style: `mapbox://styles/mapbox/dark-v11`
- Transição automática de layer baseada em zoom:
  - `zoom < 14` → Heatmap layer (dados de `noise_reports` + centro de segmentos)
  - `zoom >= 14` → Polylines coloridas por `noise_type`
- Paleta de cores:
  - `loud` → vermelho
  - `risk` → amarelo
  - `peaceful` → verde

> **Nota:** Mapbox GL JS não funciona com SSR. Todo componente que usa `mapboxgl`
> precisa de `dynamic import` com `{ ssr: false }` ou guard `typeof window !== 'undefined'`.

---

### Fase 4 — Modo Auditor (Strava do Sossego)
**O quê:** Motor de coleta de dados. A parte mais complexa.

**Fluxo:**
1. Usuário ativa "Iniciar Auditoria" → pede permissão de geolocalização
2. `watchPosition()` começa a acumular coordenadas em array local (state)
3. Interface some → ficam só os 3 botões gigantes + botão "Encerrar"
4. A cada tap num botão:
   - Marca o ponto atual no array com o tipo (`loud` / `risk` / `peaceful`)
   - Segmenta o path até aqui em um `noise_segment`
5. Ao encerrar:
   - Envia os segmentos para a **Map Matching API** do Mapbox (snap-to-road)
   - Salva resultado via Edge Function (que valida plausibilidade do trajeto)

**Configuração do watchPosition (economia de bateria):**
```js
navigator.geolocation.watchPosition(callback, error, {
  enableHighAccuracy: true,
  maximumAge: 5000,
  timeout: 10000,
})
```

---

### Fase 5 — Reporte Pontual
**O quê:** Para quem não quer fazer auditoria completa.

- Botão fixo no canto da tela
- Abre bottom sheet com os 3 tipos de ruído
- Captura posição atual uma vez com `getCurrentPosition`
- Envia para Edge Function → valida geofencing → salva

---

### Fase 6 — Edge Function Anti-Troll (Geofencing)
**O quê:** Validação server-side. Inegociável — validação só no front pode ser burlada.

```typescript
// supabase/functions/validate-noise-report/index.ts
// Recebe: { geom, noise_type, user_claimed_position }
// Valida com PostGIS:
//   SELECT ST_DWithin(
//     ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography,
//     ST_SetSRID(ST_MakePoint($report_lng, $report_lat), 4326)::geography,
//     100  -- 100 metros de raio
//   )
// Se FALSE → rejeita com 403
// Se TRUE → insere na tabela
```

---

## Decisões Arquiteturais

| Decisão | Motivo |
|---|---|
| Dados associados ao **trecho de rua**, não a pinos | Evitar processos judiciais (sem "Casa X tem cachorro barulhento") |
| Geofencing **no backend** (Edge Function + PostGIS) | Validação no front pode ser burlada por qualquer DevTools |
| Snap-to-road via **Map Matching API** | GPS do celular tem drift — sem isso as polylines ficam tortas e inúteis |
| **Dynamic import** para Mapbox GL JS | Incompatível com SSR do Next.js |
| Layout **próprio** (sem Navbar/Footer) | App fullscreen de mapa não combina com o layout editorial do site |

---

## Dependências a Instalar

```bash
npm install mapbox-gl
npm install --save-dev @types/mapbox-gl
```

## Variáveis de Ambiente a Adicionar

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...
```

---

## Ordem de Execução

| # | Fase | Entregável | Status |
|---|---|---|---|
| 1 | Fase 1 | Botão da home funciona, vitrine existe, layout do mapa criado | ⬜ |
| 2 | Fase 3 (shell) | Mapa dark aparece na tela, sem dados ainda | ⬜ |
| 3 | Fase 2 | Schema no banco, queries prontas | ⬜ |
| 4 | Fase 3 (dados) | Heatmap e polylines com dados reais | ⬜ |
| 5 | Fase 5 | Reporte pontual funcional | ⬜ |
| 6 | Fase 6 | Anti-troll ativo (Edge Function) | ⬜ |
| 7 | Fase 4 | Modo Auditor completo | ⬜ |
