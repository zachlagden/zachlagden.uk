export interface ContentData {
  metadata: Metadata;
  personal: Personal;
  navigation: NavigationItem[];
  about: About;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  certifications: Certification[];
  contact: Contact;
  footer: Footer;
}

export interface Metadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  twitterImage: string;
  googleAnalyticsId: string;
  siteUrl: string;
}

export interface Personal {
  name: string;
  title: string;
  email: string;
  location: string;
  locationMapUrl: string;
  social: {
    github: string;
    linkedin: string;
    instagram: string;
    email: string;
  };
  websites: {
    digigrow: string;
    lagdenDev: string;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
}

export interface About {
  mainDescription: string;
  professionalValues: {
    title: string;
    content: string;
  };
  currentFocus: {
    title: string;
    content: string;
  };
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  companyLink?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  location: string;
  description: string;
  skills: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  skills?: string[];
  subjects?: {
    [key: string]: string[];
  };
}

export interface Skills {
  categories: SkillCategory[];
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialId?: string | null;
  credentialUrl?: string | null;
}

export interface Contact {
  introduction: string;
  formFields: {
    name: string;
    email: string;
    message: string;
  };
  formspreeId: string;
}

export interface Footer {
  copyright: string;
  additionalLinks: {
    label: string;
    url: string;
  }[];
  sourceCode: {
    label: string;
    url: string;
  };
  note: string;
}
