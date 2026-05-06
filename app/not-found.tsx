import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card className="mx-auto mt-16 max-w-xl">
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/">Back to dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
