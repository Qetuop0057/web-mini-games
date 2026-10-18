"use client";
import { useState, type FormEvent, type ReactNode } from "react";

// 填名字和口令；口令对不对由 onSubmit 去服务器确认，失败时把错误显示在这里。
export function ConnectForm({ initialName, submitLabel, busyLabel, onSubmit, children }: {
  initialName: string;
  submitLabel: string;
  busyLabel: string;
  onSubmit: (name: string, passcode: string) => Promise<void>;
  children?: ReactNode;
}) {
  const [name, setName] = useState(initialName);
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !passcode) { setError("名字和口令都要填"); return; }
    setBusy(true);
    setError("");
    try { await onSubmit(name.trim(), passcode); } catch (caught) { setError(caught instanceof Error ? caught.message : "出错了，再试一次"); setBusy(false); }
  }

  return <form onSubmit={submit}>
    <label className="din-field"><h3>你的名字</h3><input value={name} maxLength={20} autoComplete="nickname" onChange={(event) => setName(event.target.value)} /></label>
    <label className="din-field"><h3>口令</h3><input type="password" value={passcode} autoComplete="current-password" onChange={(event) => { setPasscode(event.target.value); setError(""); }} /></label>
    {error && <p className="din-error">{error}</p>}
    <button type="submit" className="din-primary" disabled={busy}>{busy ? busyLabel : submitLabel}</button>
    {children}
  </form>;
}
