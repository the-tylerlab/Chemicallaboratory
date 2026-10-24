import { useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { RollingCounter } from "./RollingCounter";

type MountedCounter = { root: Root; host: HTMLDivElement; input: HTMLInputElement; visibilityObserver: MutationObserver };
const mounted = new Map<HTMLInputElement, MountedCounter>();
const selector = "input[data-rolling-counter]";

function CounterBridge({ input }: { input: HTMLInputElement }) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 99999);
  const readValue = () => {
    const parsed = Number(input.value);
    return input.value !== "" && Number.isFinite(parsed) ? parsed : min;
  };
  const [value, setValue] = useState(readValue);
  const [language, setLanguage] = useState(document.documentElement.lang || "th");

  useEffect(() => {
    const sync = () => {
      if (input.value === "") input.value = String(min);
      setValue(readValue());
    };
    const onReset = () => window.setTimeout(sync, 0);
    if (input.value === "") input.value = String(min);
    input.addEventListener("input", sync);
    input.addEventListener("change", sync);
    input.form?.addEventListener("reset", onReset);
    const languageObserver = new MutationObserver(() => setLanguage(document.documentElement.lang || "th"));
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => {
      input.removeEventListener("input", sync);
      input.removeEventListener("change", sync);
      input.form?.removeEventListener("reset", onReset);
      languageObserver.disconnect();
    };
  }, [input]);

  const label = input.labels?.[0]?.textContent?.replace(/\s+/g, " ").trim() || input.getAttribute("aria-label") || "Quantity";
  const update = (next: number) => {
    input.value = String(next);
    setValue(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <RollingCounter
      value={value}
      min={min}
      max={max}
      compact
      ariaLabel={label}
      decreaseLabel={language === "en" ? "Decrease quantity" : "ลดจำนวน"}
      increaseLabel={language === "en" ? "Increase quantity" : "เพิ่มจำนวน"}
      onChange={update}
    />
  );
}

function isIntegerQuantity(input: HTMLInputElement) {
  return input.dataset.rollingCounter !== undefined && input.step !== "any" && !input.readOnly && !input.disabled;
}

function mount(input: HTMLInputElement) {
  if (mounted.has(input) || !isIntegerQuantity(input)) return;
  const host = document.createElement("div");
  host.className = "rct-host";
  host.dataset.forInput = input.id || input.name || "quantity";
  host.style.width = input.style.width || "100%";
  input.insertAdjacentElement("afterend", host);

  const parent = input.parentElement;
  if (parent?.querySelector(":scope > span")) parent.classList.add("rct-field-container");
  input.classList.add("rct-native-source");
  input.setAttribute("aria-hidden", "true");
  input.tabIndex = -1;

  input.labels?.forEach((label) => {
    label.addEventListener("click", () => host.querySelector<HTMLElement>(".rct-num")?.focus());
  });
  host.addEventListener("click", (event) => event.stopPropagation());
  const syncVisibility = () => {
    host.hidden = getComputedStyle(input).display === "none" || input.hidden;
  };
  syncVisibility();
  const visibilityObserver = new MutationObserver(syncVisibility);
  visibilityObserver.observe(input, { attributes: true, attributeFilter: ["style", "class", "hidden"] });

  const root = createRoot(host);
  mounted.set(input, { root, host, input, visibilityObserver });
  root.render(<CounterBridge input={input} />);
}

function scan(root: ParentNode) {
  if (root instanceof HTMLInputElement && root.matches(selector)) mount(root);
  root.querySelectorAll?.(selector).forEach((input) => mount(input as HTMLInputElement));
}

function unmountRemoved(node: Node) {
  const inputs: HTMLInputElement[] = [];
  if (node instanceof HTMLInputElement) inputs.push(node);
  if (node instanceof Element) inputs.push(...node.querySelectorAll<HTMLInputElement>(selector));
  inputs.forEach((input) => {
    const entry = mounted.get(input);
    if (!entry || input.isConnected) return;
    entry.visibilityObserver.disconnect();
    entry.root.unmount();
    entry.host.remove();
    mounted.delete(input);
  });
}

function installRollingCounters() {
  scan(document);
  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => scan(node as ParentNode));
      record.removedNodes.forEach(unmountRemoved);
    });
  });
  observer.observe(document.body, { subtree: true, childList: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", installRollingCounters, { once: true });
} else {
  installRollingCounters();
}
