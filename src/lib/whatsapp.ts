const PHONE = "254753366995";
const MSG = "Hello SKYWAVE NEXUS Integrated Solutions, I would like to request a service.";

export function whatsappLink(custom?: string) {
  const text = encodeURIComponent(custom ?? MSG);
  return `https://wa.me/${PHONE}?text=${text}`;
}
