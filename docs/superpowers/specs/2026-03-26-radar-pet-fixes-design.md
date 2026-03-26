# Radar Pet — Correções e Melhorias

**Data:** 2026-03-26
**Escopo:** 11 correções/melhorias na ferramenta Radar Pet

---

## 1. Cartaz com zoom excessivo (PosterGenerator)

**Problema:** O cartaz tem `width: 794px` fixo. Em viewports menores causa overflow e esconde os botões de download e fechar.

**Solução:** O container do cartaz mantém 794px no DOM (para que `html2canvas` renderize em alta resolução), mas recebe `transform: scale(factor)` calculado dinamicamente com base em `window.innerHeight` e `window.innerWidth`. O container externo usa `overflow-y: auto` com altura máxima de viewport. Os controles (botões) ficam fora do elemento escalado para sempre serem visíveis.

---

## 2. URL completa aparece no download

**Problema:** `link.href = canvas.toDataURL(...)` expõe a data URL na barra de status do browser.

**Solução:** Usar `canvas.toBlob()` + `URL.createObjectURL(blob)`. Após o clique, revogar a URL com `URL.revokeObjectURL()`. O browser exibirá apenas `cartaz-Sniff.png` para o usuário.

---

## 3. Mapa mostra vazio sem cidade

**Problema:** Quando GPS não está disponível e o usuário não digitou cidade, o mapa não aparece — só um texto de placeholder.

**Solução:** Adicionar função `getCityWithMostPets()` em `supabase-pets.ts` que faz `GROUP BY city` e retorna a cidade com mais pets ativos. Ao carregar a página, se GPS não resolver em 2s, carregar essa cidade como padrão visual do mapa. O mapa aparece imediatamente com marcações reais, deixando claro ao usuário que pode pesquisar sua própria região.

```ts
// supabase-pets.ts
export async function getCityWithMostPets(): Promise<string | null>
```

---

## 4. Clique no marker → popup em vez de navegação

**Problema:** Clicar num ponto navega diretamente para a página do pet, sem contexto.

**Solução:** Substituir `router.push(...)` pelo `mapboxgl.Popup`. O popup exibe:
- Foto do pet (thumbnail 72x72, `object-fit: cover`, borda preta)
- Nome do pet ou "Sem nome"
- Badge colorido: 🔴 Perdido / 🟢 Encontrado
- Botão "Ver detalhes" que navega para `/ferramentas/radar-pet/pet/[id]`

O popup é criado com HTML via `setHTML()` do Mapbox, com estilos inline para funcionar fora do contexto React.

---

## 5. Título do cartaz desalinhado

**Problema:** Título "PROCURA-SE" está alinhado à esquerda com fonte genérica.

**Solução:** Centralizar o título (`text-align: center`). Trocar fonte para `Space Grotesk` (já carregada no site via `next/font`). Verificar se a fonte está disponível via CSS variable ou importá-la explicitamente com `@import` dentro do componente de cartaz usando `<style>`.

---

## 6. Gratificação na linha errada

**Problema:** `reward_amount` aparece numa linha separada abaixo das outras infos.

**Solução:** Mover a gratificação para a mesma linha do bloco de legenda (nome · raça · bairro · R$ valor), como parte do `caption` ou adicionada inline ao lado.

---

## 7. "R$" automático na gratificação

**Problema:** O valor de gratificação é exibido sem prefixo monetário.

**Solução:** No `PosterGenerator`, ao exibir `pet.reward_amount`, prefixar com `R$ ` se ainda não começar com ele:
```ts
const rewardDisplay = amount.startsWith("R$") ? amount : `R$ ${amount}`;
```

---

## 8. Redesign do cartaz (hierarquia e escala de cinza)

**Objetivo:** Cartaz simples mas elegante, preto e branco com escala de cinza.

**Mudanças:**
- Cabeçalho: fundo `#111` com título branco centrado (Space Grotesk 900)
- Subtítulo de status (PERDIDO/ENCONTRADO) abaixo do título, fonte menor
- Foto: ocupa largura total, altura fixa 460px, borda 4px `#000`
- Bloco de info: fundo `#f4f4f4`, padding 24px, tipografia hierárquica
  - Nome em destaque (28px, bold)
  - Raça/Bairro em cinza médio (16px)
  - Gratificação em cinza escuro (16px bold)
- Rodapé: fundo `#222`, texto branco + QR code com fundo branco
- Descrição: área de texto com fundo branco, border-top `#ddd`

---

## 9. WhatsApp: auto-prefixar 55

**Problema:** O sistema espera número com DDI 55, mas o usuário digita só DDD + número.

**Solução:** Em `PetForm.tsx`, no `handleSubmit`, após `replace(/\D/g, "")`:
```ts
const withCountry = whatsappClean.startsWith("55")
  ? whatsappClean
  : `55${whatsappClean}`;
```
Salvar `withCountry` no banco. Isso garante que o link `https://wa.me/55XXXXXXXXXXX` funcione corretamente.

---

## 10. Imagem distorcida no download (html2canvas)

**Problema:** `html2canvas` não respeita `object-fit: cover` em `<img>`, resultando em imagem achatada no PNG gerado.

**Solução:** Substituir o `<img>` por um `<div>` com `background-image`, `background-size: cover` e `background-position: center`. O html2canvas respeita corretamente esse padrão CSS.

```ts
<div style={{
  width: "100%",
  height: "460px",
  backgroundImage: `url(${pet.photo_url})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
}} />
```

---

## 11. Editar cartaz (nova rota)

**Problema:** Não existe forma de editar um pet cadastrado.

**Solução:**
- Criar rota `/ferramentas/radar-pet/editar/[id]/page.tsx`
- Criar `PetEditForm.tsx` (variante do `PetForm`) que:
  - Carrega o pet pelo ID via `getPetById()`
  - Valida que `user.id === pet.user_id` (só dono pode editar)
  - Pré-popula todos os campos
  - Chama `updatePet(id, updates)` ao submeter
  - Redireciona para `/meus-pets` após sucesso
- Adicionar botão "Editar" na página `/meus-pets` ao lado de cada pet

**Nota:** A foto pode ser substituída opcionalmente — se nenhum novo arquivo for selecionado, mantém a `photo_url` atual.

---

## Arquivos a modificar/criar

| Arquivo | Ação |
|---|---|
| `_components/PosterGenerator.tsx` | Modificar (itens 1, 2, 5, 6, 7, 8, 10) |
| `_components/MapHub.tsx` | Modificar (item 4) |
| `page.tsx` (hub) | Modificar (item 3) |
| `_lib/supabase-pets.ts` | Modificar (item 3, 9 — nova query + fix whatsapp) |
| `_components/PetForm.tsx` | Modificar (item 9) |
| `meus-pets/page.tsx` | Modificar (item 11 — botão editar) |
| `editar/[id]/page.tsx` | Criar (item 11) |
| `_components/PetEditForm.tsx` | Criar (item 11) |
