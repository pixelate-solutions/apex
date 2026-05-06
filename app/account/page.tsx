import { AccountPanel } from "@/components/account-panel";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-muted-foreground">Account</p>
        <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">Persistence and identity</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Sign in with Clerk and exercise the backend routes for user-owned shot records and object storage.
        </p>
      </div>
      <AccountPanel />
    </div>
  );
}
