"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { CloudUpload, ShieldCheck, UserRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountPanel() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5" />
            User account
          </CardTitle>
          <CardDescription>Clerk manages sign-in, sign-up, sessions, and user profile controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoaded && isSignedIn ? (
            <div className="space-y-4">
              <div className="rounded-3xl border bg-emerald-50 p-4 text-emerald-950">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">Signed in with Clerk</p>
                    <p className="text-sm opacity-75">
                      {user?.primaryEmailAddress?.emailAddress ?? user?.fullName ?? "Authenticated user"}
                    </p>
                  </div>
                  <UserButton />
                </div>
              </div>
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Backend sync enabled</AlertTitle>
                <AlertDescription>Saved analyses can sync source video, thumbnails, and shot records under your Clerk user ID.</AlertDescription>
              </Alert>
            </div>
          ) : null}

          {isLoaded && !isSignedIn ? (
            <div className="space-y-4">
              <div className="rounded-3xl border bg-background p-4">
                <p className="font-semibold">Sign in to enable backend sync</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You can still analyze and save shots locally without an account.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <SignInButton mode="modal">
                  <Button>Sign in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="accent">
                    Create account
                  </Button>
                </SignUpButton>
              </div>
            </div>
          ) : null}

          {!isLoaded ? <p className="text-sm text-muted-foreground">Loading account state...</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5" />
            Backend persistence status
          </CardTitle>
          <CardDescription>Server routes now authorize requests through Clerk before touching shot records or object storage.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Status label="Auth provider" value="Clerk" />
          <Status label="Shot records" value="/api/server-shots" />
          <Status label="Object upload" value="/api/objects" />
          <Status label="Storage driver" value="Local, S3 stub" />
          <Alert className="sm:col-span-2">
            <AlertTitle>POC storage behavior</AlertTitle>
            <AlertDescription>
              Browser analysis still saves locally first. The new APIs give the app a backend path for user-owned shot sync and source video storage.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border bg-background p-4">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}
