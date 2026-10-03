import { Mail, Phone, Send } from 'lucide-react';

export const contactData = [
    {
        icon: Mail,
        title: 'Email',
        text: 'Our team is here to help.',
        value: 'contact@smmexpertservice.com',
        href: 'mailto:contact@smmexpertservice.com',
    },
    {
        icon: Phone,
        title: 'WhatsApp',
        text: 'Get quick help with orders.',
        value: '+1 (845) 717-3694',
        href: 'https://wa.me/18457173694',
    },
    {
        icon: Send,
        title: 'Telegram',
        text: 'Connect with us for quick support.',
        value: '@SMMExpertService',
        href: 'https://t.me/SMMExpertService',
    },
] as const;

export type ContactData = (typeof contactData)[number];
