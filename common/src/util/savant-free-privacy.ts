import type { SavantFreeIpPrivacySignal } from '../types/savant-free-session'

export const SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNALS = [
  'vpn',
  'proxy',
  'tor',
  'res_proxy',
] as const satisfies readonly SavantFreeIpPrivacySignal[]

type SavantFreeHardBlockedPrivacySignal =
  (typeof SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNALS)[number]

const SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNAL_SET =
  new Set<SavantFreeIpPrivacySignal>(SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNALS)

const SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNAL_LABELS: Record<
  SavantFreeHardBlockedPrivacySignal,
  string
> = {
  vpn: 'VPN',
  proxy: 'proxy',
  res_proxy: 'proxy',
  tor: 'Tor',
}

export function isSavantFreeHardBlockedPrivacySignal(
  signal: SavantFreeIpPrivacySignal,
): signal is SavantFreeHardBlockedPrivacySignal {
  return SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNAL_SET.has(signal)
}

export function formatSavantFreeHardBlockedPrivacySignals(
  signals: readonly SavantFreeIpPrivacySignal[] | null | undefined,
): string {
  const labels = Array.from(
    new Set(
      (signals ?? []).flatMap((signal): string[] => {
        if (!isSavantFreeHardBlockedPrivacySignal(signal)) return []
        return [SAVANT_FREE_HARD_BLOCKED_PRIVACY_SIGNAL_LABELS[signal]]
      }),
    ),
  )

  if (labels.length === 0) return 'VPN, proxy, or Tor'
  if (labels.length === 1) return labels[0]
  return `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`
}

export function formatSavantFreeHardBlockedMessage(
  signals: readonly SavantFreeIpPrivacySignal[] | null | undefined,
): string {
  return `SavantFree cannot be used from ${formatSavantFreeHardBlockedPrivacySignals(
    signals,
  )} traffic. Please disable it and try again.`
}
