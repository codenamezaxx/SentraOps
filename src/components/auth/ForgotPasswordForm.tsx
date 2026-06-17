"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const supabase = createClient();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSent(true);
      toast.success("Instruksi reset kata sandi telah dikirim ke email Anda.");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Terjadi kesalahan saat memproses permintaan");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className="text-center space-y-4">
        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full w-fit mx-auto">
          <Mail className="h-6 w-6 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Cek Email Anda</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Kami telah mengirimkan tautan untuk mengatur ulang kata sandi ke email Anda.
        </p>
        <Button
          asChild
          variant="outline"
          className="w-full h-12 rounded-xl border-zinc-200 dark:border-zinc-800"
        >
          <Link href="/login">Kembali ke Masuk</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                  <Input
                    placeholder="nama@email.com"
                    type="email"
                    className="pl-10 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-orange-500"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            "Kirim Instruksi Reset"
          )}
        </Button>
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Masuk
        </Link>
      </form>
    </Form>
  );
}