import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Header({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-2xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <CardAction>{children}</CardAction>
      </CardHeader>
    </Card>
  );
}
