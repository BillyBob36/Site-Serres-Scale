import I18nWrapper from "./I18nWrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <I18nWrapper>{children}</I18nWrapper>;
}
