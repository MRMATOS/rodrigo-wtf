"use client";

import { useState } from "react";

const STEPS = [
  "O que te atrapalha hoje? O que está lento, ultrapassado e você quer mudar?",
  "Eu vou analisar o cenário, entender as possíveis soluções e criar um plano.",
  "Nós vamos discutir a viabilidade e definir a execução.",
  "Eu vou iniciar o desenvolvimento. Durante o processo, será possível testar e refinar.",
  "Você recebe a solução pronta, com documentação e suporte.",
];

const EXAMPLES = [
  {
    label: "Supermercado",
    steps: [
      "No meu supermercado, para fazer cotação, os compradores de frutas imprimem as listas de preços que recebem pelo WhatsApp dos fornecedores.",
      "Vou entender o lado do fornecedor, como são as listas e como é o fluxo de trabalho do comprador. Vou pensar num sistema que se conecte ao WhatsApp e crie as cotações automaticamente, gerando histórico e auxiliando na compra.",
      "A minha ideia entra em conflito com algum processo? Precisa verificar com outra pessoa? Vamos tratar prazos e valores.",
      "Já desenvolvi a parte que processa a lista, dê uma olhada. Peça para um comprador testar.",
      "Esse é o aplicativo junto com o documento que explica todo o funcionamento. Quero agendar um dia para ensinar como usar e tirar todas as dúvidas.",
    ],
  },
  {
    label: "Clínica",
    steps: [
      "Os pacientes ligam para agendar, a secretária anota no caderno e frequentemente há conflito de horários ou esquecimento de consultas.",
      "Vou entender o fluxo atual da recepção, os tipos de consulta e os horários disponíveis. Planejo um sistema de agendamento online com confirmação automática pelo WhatsApp.",
      "O sistema precisa se integrar com o que já usam? Tem alguma restrição com convênios? Vamos alinhar o que pode ser feito e o prazo.",
      "O agendamento online já está funcionando em ambiente de teste. Peça para a secretária e um paciente de confiança experimentar.",
      "Aqui está o sistema com o manual de uso. Marcamos um treinamento com a equipe e fico disponível para ajustes após o uso real.",
    ],
  },
  {
    label: "Escritório contábil",
    steps: [
      "Os clientes enviam documentos por e-mail, WhatsApp e até fisicamente. Fica difícil rastrear o que chegou, o que falta e o que já foi processado.",
      "Vou mapear todos os tipos de documentos recebidos e entender o fluxo interno de cada contador. Planejo um portal simples onde o cliente envia tudo em um só lugar.",
      "Os clientes vão aderir a uma plataforma nova? Tem integração com o sistema contábil atual? Vamos definir o que é viável e o cronograma.",
      "O portal de envio já está pronto. Teste com dois ou três clientes antes de abrir para todos.",
      "Portal entregue com documentação para o time e para os clientes. Disponível para suporte na transição e ajustes conforme o uso.",
    ],
  },
  {
    label: "Loja",
    steps: [
      "O controle de estoque é feito em planilha, mas ninguém atualiza na hora. Sempre tem produto em falta que ninguém percebeu a tempo.",
      "Vou acompanhar o fluxo de entrada e saída de produtos e entender como a equipe trabalha no dia a dia. Planejo um controle simples que qualquer funcionário consiga usar no celular.",
      "A equipe tem smartphone? Tem algum produto ou categoria que precisa de atenção especial? Vamos definir o escopo e o prazo.",
      "A tela de registro de entrada e saída está funcionando. Coloca um funcionário para testar durante uma semana real.",
      "Sistema entregue com treinamento presencial para a equipe. Ajustes finos nas primeiras semanas de uso incluídos.",
    ],
  },
];

export default function ProcessoBlock() {
  const [exampleIndex, setExampleIndex] = useState<number | null>(null);

  function handleNext() {
    setExampleIndex((prev) =>
      prev === null ? 0 : (prev + 1) % EXAMPLES.length
    );
  }

  const current = exampleIndex !== null ? EXAMPLES[exampleIndex] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Steps */}
      <div className="flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <div key={i} className="flex gap-4 items-start">
            <span className="font-heading text-2xl md:text-3xl font-bold text-blue dark:text-acid shrink-0 leading-tight">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1 pt-1">
              <p className="font-body text-base md:text-lg font-bold leading-snug">
                {step}
              </p>
              {current && (
                <p className="font-body text-sm md:text-base text-muted leading-relaxed border-l-3 border-blue dark:border-acid pl-3 mt-1">
                  {current.steps[i]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={handleNext}
          className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body text-sm font-bold uppercase tracking-wide"
        >
          {current ? `[→] Próximo exemplo` : `[+] Ver exemplo real`}
        </button>
        {current && (
          <span className="font-body text-sm font-bold uppercase tracking-widest text-muted">
            // {current.label}
          </span>
        )}
      </div>
    </div>
  );
}
