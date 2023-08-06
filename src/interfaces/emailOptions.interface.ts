export interface EmailOptions {
    userName?:string,
    verificationLink?:string;
    from?: string | Address;
    sender?: string | Address;
    to?: string | Address | Array<string | Address>;
    cc?: string | Address | Array<string | Address>;
    bcc?: string | Address | Array<string | Address>;
    replyTo?: string | Address | Array<string | Address>;
    inReplyTo?: string | Address;
    references?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
    watchHtml?: string;
    amp?: string;
    icalEvent?: string;
    messageId?: string;
    date?: Date | string;
    encoding?: string;
    disableUrlAccess?: boolean;
    disableFileAccess?: boolean;
    priority?: "high" | "normal" | "low";
    attachDataUrls?: boolean;
}

interface Address {
    name: string;
    address: string;
}