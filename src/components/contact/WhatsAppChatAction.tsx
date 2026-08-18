import Image from "next/image";
import { site } from "@/data/site";

type WhatsAppChatActionProps = {
  className?: string;
};

const whatsappNumber = site.phone.replace(/\D/g, "");

export default function WhatsAppChatAction({ className = "" }: WhatsAppChatActionProps) {
  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex w-full items-center justify-center gap-2 border border-zinc-200 bg-white px-4 py-1 text-sm font-medium text-zinc-900 transition-colors hover:border-[#25d366] hover:text-[#128c7e] ${className}`}
      aria-label="Chat with us on WhatsApp"
    >
      <Image
        src="/Images/Social/Whatapp.png"
        alt=""
        width={24}
        height={24}
        className="h-8 w-8 object-contain"
      />
      <span>Chat with us</span>
    </a>
  );
}
