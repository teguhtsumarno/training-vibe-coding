export type SmtpSettings = {
  id: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  enabled: boolean;
};

export type SmtpFormData = {
  host: string;
  port: string;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  enabled: boolean;
};
