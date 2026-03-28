"use client";

import { ArrowLeft, LockKeyhole, Radar } from "lucide-react";

import { GradientMesh } from "@/components/ui/gradient-mesh";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field-1";
import { Input } from "@/components/ui/input";
import { LiquidButton, MetalButton } from "@/components/ui/liquid-glass-button";
import { cn } from "@/lib/utils";

type DemoPageProps = {
  email: string;
  password: string;
  error?: string | null;
  loading?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
};

export function DemoPage({
  email,
  password,
  error = null,
  loading = false,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onBack,
}: DemoPageProps) {
  return (
    <div className="grid min-h-svh bg-[linear-gradient(180deg,#040816_0%,#07101d_100%)] lg:grid-cols-2">
      <div className="relative flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <button type="button" aria-label="home" onClick={onBack} className="flex items-center gap-3 text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-300/75">Sentinel access</div>
              <div className="text-sm font-medium text-white">Operator login</div>
            </div>
          </button>
        </div>

        <div className="flex flex-1 w-full items-center justify-center">
          <div className="w-full max-w-md">
            <form className="flex flex-col gap-6" onSubmit={onSubmit}>
              <FieldGroup className="rounded-[32px] border border-white/10 bg-slate-950/65 p-8 shadow-[0_30px_90px_rgba(2,6,23,0.42)] backdrop-blur">
                <div className="flex flex-col items-center gap-1 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.28em] text-cyan-200">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    Secure Entry
                  </div>
                  <h1 className="mt-4 text-3xl font-bold text-white">Login to your account</h1>
                  <p className="text-muted-foreground mt-2 text-sm text-balance">
                    Authenticated entry for operators and analysts. Enter your email and password to access the
                    strategic console.
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="commander@sentinel.mil"
                    required
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                  />
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <span className="ml-auto text-sm text-slate-400">Secure operator access</span>
                  </div>
                  <Input
                    id="password"
                    placeholder="sentinel2026"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => onPasswordChange(event.target.value)}
                  />
                </Field>

                <FieldError>{error}</FieldError>

                <Field>
                  <MetalButton
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="h-12 w-full rounded-xl text-base tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Authenticating..." : "Login"}
                  </MetalButton>
                </Field>

                <FieldSeparator>Mission access</FieldSeparator>

                <Field className="gap-4">
                  <LiquidButton
                    className="w-full justify-center gap-2 rounded-full text-sm text-white [text-shadow:none]"
                    variant="outline"
                    size="xl"
                    type="button"
                    onClick={onBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to landing
                  </LiquidButton>
                  <FieldDescription className="text-center">
                    Demo credentials: <span className="text-white">commander@sentinel.mil / sentinel2026</span>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-muted relative hidden overflow-hidden lg:block">
        <GradientMesh
          colors={["#06162f", "#00aaff", "#ffd447"]}
          distortion={8}
          swirl={0.2}
          speed={1}
          rotation={90}
          waveAmp={0.2}
          waveFreq={20}
          waveSpeed={0.2}
          grain={0.06}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,22,47,0.18),rgba(6,22,47,0.62))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_80%_65%,rgba(255,255,255,0.08),transparent_22%)]" />
      </div>
    </div>
  );
}
