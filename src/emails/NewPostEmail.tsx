import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

interface NewPostEmailProps {
  postTitle: string;
  postFirstParagraph: string;
  postUrl: string;
  category: string;
  coverImage?: string;
  unsubscribeUrl: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  analises: "Análises",
  projetos: "Projetos",
  ferramentas: "Ferramentas",
  "sites-e-aplicativos": "Sites e Aplicativos",
};

export default function NewPostEmail({
  postTitle = "Título do post de exemplo",
  postFirstParagraph = "Este é o primeiro parágrafo do post, onde você vai ter uma ideia do que está sendo discutido antes de clicar para continuar lendo no site.",
  postUrl = "https://rodrigo.wtf",
  category = "projetos",
  coverImage,
  unsubscribeUrl = "https://rodrigo.wtf/api/unsubscribe?email=exemplo@email.com",
}: Partial<NewPostEmailProps>) {
  const categoryLabel = CATEGORY_LABEL[category] ?? category;

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{postTitle}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Text style={logo}>RODRIGO.WTF</Text>
              </Column>
              <Column align="right">
                <Text style={categoryTag}>{categoryLabel}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Cover image */}
          {coverImage && (
            <Section style={{ marginBottom: "0px" }}>
              <Img
                src={coverImage}
                alt={postTitle}
                width="560"
                style={coverImg}
              />
            </Section>
          )}

          {/* Post title */}
          <Section style={contentSection}>
            <Heading style={heading}>{postTitle}</Heading>

            {/* First paragraph */}
            <Text style={paragraph}>{postFirstParagraph}</Text>

            {/* CTA */}
            <Section style={btnSection}>
              <Button style={btn} href={postUrl}>
                Continuar lendo →
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section>
            <Text style={footer}>
              Você recebeu esse email porque assinou a newsletter do rodrigo.wtf.{" "}
              <Link href={unsubscribeUrl} style={unsubLink}>
                Cancelar inscrição
              </Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f4f4f4",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const container = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
};

const header = {
  padding: "24px 32px",
};

const logo = {
  fontSize: "16px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  color: "#000000",
  margin: "0",
};

const categoryTag = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  color: "#888888",
  margin: "0",
};

const hr = {
  borderColor: "#e8e8e8",
  margin: "0",
};

const coverImg = {
  width: "100%",
  display: "block",
  objectFit: "cover" as const,
};

const contentSection = {
  padding: "36px 32px 32px",
};

const heading = {
  fontSize: "30px",
  fontWeight: "700",
  color: "#000000",
  margin: "0 0 20px",
  lineHeight: "1.2",
};

const paragraph = {
  fontSize: "16px",
  color: "#444444",
  lineHeight: "1.7",
  margin: "0 0 32px",
};

const btnSection = {
  marginTop: "8px",
};

const btn = {
  backgroundColor: "#CCFF00",
  color: "#000000",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  padding: "16px 32px",
  textDecoration: "none",
  display: "inline-block",
  border: "3px solid #000000",
  boxShadow: "4px 4px 0px #000000",
  fontFamily: "'Courier New', Courier, monospace",
};

const footer = {
  fontSize: "12px",
  color: "#aaaaaa",
  lineHeight: "1.6",
  padding: "24px 32px",
  margin: "0",
};

const unsubLink = {
  color: "#aaaaaa",
  textDecoration: "underline",
};
