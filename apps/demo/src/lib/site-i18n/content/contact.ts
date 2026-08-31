import type { SiteLocale } from "../locale";

export interface ContactContent {
  eyebrow: string;
  title: string;
  description: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  successTitle: string;
  successMessage: string;
  genericErrorMessage: string;
}

export const contactContent: Record<SiteLocale, ContactContent> = {
  ko: {
    eyebrow: "Contact",
    title: "문의하기",
    description: "InstaFix에 대한 질문, 제안, 버그 제보 등 무엇이든 남겨주세요. 확인 후 이메일로 답변드리겠습니다.",
    nameLabel: "이름",
    namePlaceholder: "홍길동",
    emailLabel: "이메일",
    emailPlaceholder: "you@example.com",
    messageLabel: "메시지",
    messagePlaceholder: "문의하실 내용을 자세히 적어주세요.",
    submitLabel: "보내기",
    submittingLabel: "전송 중...",
    successTitle: "문의가 접수되었습니다",
    successMessage: "빠른 시일 내에 답변드리겠습니다. 감사합니다.",
    genericErrorMessage: "전송에 실패했습니다. 잠시 후 다시 시도해주세요.",
  },
  en: {
    eyebrow: "Contact",
    title: "Get in touch",
    description: "Have a question, a suggestion, or found a bug? Let us know — we'll get back to you by email.",
    nameLabel: "Name",
    namePlaceholder: "Jane Doe",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    messageLabel: "Message",
    messagePlaceholder: "Tell us what's on your mind.",
    submitLabel: "Send",
    submittingLabel: "Sending...",
    successTitle: "Your message has been received",
    successMessage: "We'll get back to you soon. Thank you.",
    genericErrorMessage: "Something went wrong. Please try again in a moment.",
  },
  fr: {
    eyebrow: "Contact",
    title: "Contactez-nous",
    description: "Une question, une suggestion, ou un bug à signaler ? Écrivez-nous — nous vous répondrons par e-mail.",
    nameLabel: "Nom",
    namePlaceholder: "Jean Dupont",
    emailLabel: "E-mail",
    emailPlaceholder: "vous@exemple.com",
    messageLabel: "Message",
    messagePlaceholder: "Décrivez-nous votre demande en détail.",
    submitLabel: "Envoyer",
    submittingLabel: "Envoi en cours...",
    successTitle: "Votre message a bien été reçu",
    successMessage: "Nous vous répondrons rapidement. Merci.",
    genericErrorMessage: "Une erreur est survenue. Veuillez réessayer dans un instant.",
  },
};
