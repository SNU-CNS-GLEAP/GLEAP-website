import koMessages from "../../messages/ko.json";
import enMessages from "../../messages/en.json";
import { about } from "@/content/about";
import { activityCategories } from "@/content/activities";
import { cohorts } from "@/content/members";
import type { ActivityCategory } from "@/content/activities";
import type { Cohort } from "@/content/members";
import type { LocalizedText } from "@/lib/localized-text";

export type ManagedLocale = "ko" | "en";
export const managedLocales: ManagedLocale[] = ["ko", "en"];

export type HomeCopy = typeof koMessages.HomePage;
export type AboutPageCopy = typeof koMessages.AboutPage;
export type ActivitiesPageCopy = typeof koMessages.ActivitiesPage;
export type MembersPageCopy = typeof koMessages.MembersPage;
export type AlumniPageCopy = typeof koMessages.AlumniPage;
export type FooterCopy = typeof koMessages.Footer;
export type MetadataCopy = typeof koMessages.Metadata;
export type NavCopy = typeof koMessages.Nav;
export type NewsPageCopy = typeof koMessages.NewsPage;

export type HomeContentDocument = {
  copy: Record<ManagedLocale, HomeCopy>;
  assets: {
    hero: string;
    campus: string;
    academic: string;
    social: string;
    exchange: string;
    global: string;
  };
  stats: {
    founded: number;
    pillars: number;
    reach: number;
  };
};

export type AboutContentDocument = {
  copy: Record<ManagedLocale, AboutPageCopy>;
  stats: {
    founded: number;
    studentLed: number;
    pillars: number;
  };
  motto: LocalizedText;
  paragraphs: LocalizedText[];
  image: string;
  imageCaption: LocalizedText;
};

export type ActivitiesContentDocument = {
  copy: Record<ManagedLocale, ActivitiesPageCopy>;
  programCopy: Record<ManagedLocale, HomeCopy["programs"]>;
  categories: ActivityCategory[];
  images: Record<"academic" | "social" | "exchange", string>;
};

export type MembersContentDocument = {
  copy: Record<ManagedLocale, MembersPageCopy>;
  alumniCopy: Record<ManagedLocale, AlumniPageCopy>;
  cohorts: Cohort[];
  currentCohortCount: number;
};

export type SiteSettingsDocument = {
  navigation: Record<ManagedLocale, NavCopy>;
  footer: Record<ManagedLocale, FooterCopy>;
  metadata: Record<ManagedLocale, MetadataCopy>;
  contactEmail: string;
  developerName: LocalizedText;
  developerLink: string;
};

export type NewsContentDocument = {
  copy: Record<ManagedLocale, NewsPageCopy>;
};

export type SiteContentKey = "home" | "about" | "activities" | "members" | "news" | "settings";

export type SiteContentDocumentMap = {
  home: HomeContentDocument;
  about: AboutContentDocument;
  activities: ActivitiesContentDocument;
  members: MembersContentDocument;
  news: NewsContentDocument;
  settings: SiteSettingsDocument;
};

export const defaultHomeContent: HomeContentDocument = {
  copy: {
    ko: koMessages.HomePage,
    en: enMessages.HomePage,
  },
  assets: {
    hero: "/home/hero.webp",
    campus: "/home/campus.png",
    academic: "/home/academic.webp",
    social: "/home/impact.webp",
    exchange: "/home/exchange.webp",
    global: "/home/global-lab.webp",
  },
  stats: { founded: 2012, pillars: 3, reach: 200 },
};

export const defaultAboutContent: AboutContentDocument = {
  copy: { ko: koMessages.AboutPage, en: enMessages.AboutPage },
  stats: { founded: 2012, studentLed: 100, pillars: 3 },
  motto: about.motto,
  paragraphs: about.paragraphs,
  image: "/home/campus.png",
  imageCaption: { ko: "서울대학교 자연과학대학", en: "SNU College of Natural Sciences" },
};

export const defaultActivitiesContent: ActivitiesContentDocument = {
  copy: { ko: koMessages.ActivitiesPage, en: enMessages.ActivitiesPage },
  programCopy: { ko: koMessages.HomePage.programs, en: enMessages.HomePage.programs },
  categories: activityCategories,
  images: {
    academic: "/home/academic.webp",
    social: "/home/impact.webp",
    exchange: "/home/exchange.webp",
  },
};

export const defaultMembersContent: MembersContentDocument = {
  copy: { ko: koMessages.MembersPage, en: enMessages.MembersPage },
  alumniCopy: { ko: koMessages.AlumniPage, en: enMessages.AlumniPage },
  cohorts,
  currentCohortCount: 2,
};

export const defaultSiteSettings: SiteSettingsDocument = {
  navigation: { ko: koMessages.Nav, en: enMessages.Nav },
  footer: { ko: koMessages.Footer, en: enMessages.Footer },
  metadata: { ko: koMessages.Metadata, en: enMessages.Metadata },
  contactEmail: "snucnsgleap@gmail.com",
  developerName: { ko: "글홈 TF", en: "GLEAP Home TF" },
  developerLink: "https://github.com/SNU-CNS-GLEAP/GLEAP-website",
};

export const defaultNewsContent: NewsContentDocument = {
  copy: { ko: koMessages.NewsPage, en: enMessages.NewsPage },
};

export const defaultSiteContent: SiteContentDocumentMap = {
  home: defaultHomeContent,
  about: defaultAboutContent,
  activities: defaultActivitiesContent,
  members: defaultMembersContent,
  news: defaultNewsContent,
  settings: defaultSiteSettings,
};
