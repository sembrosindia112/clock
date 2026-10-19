import React, { useState } from 'react';
import { X, Copy, Check, Code, Layers, FileCode } from 'lucide-react';

interface AngularSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AngularSourceModal: React.FC<AngularSourceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'component' | 'template' | 'service' | 'module'>('component');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const componentTs = `// digital-clock.component.ts
import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockService, TimeData } from './clock.service';
import { SevenSegmentComponent } from './seven-segment.component';

@Component({
  selector: 'app-digital-clock',
  standalone: true,
  imports: [CommonModule, SevenSegmentComponent],
  templateUrl: './digital-clock.component.html',
  styleUrls: ['./digital-clock.component.scss']
})
export class DigitalClockComponent implements OnInit, OnDestroy {
  private clockService = inject(ClockService);

  // Angular Signals for high-performance reactive updates
  readonly currentTime = this.clockService.currentTime;
  readonly is24Hour = signal<boolean>(true);
  readonly showSeconds = signal<boolean>(true);
  readonly showMillis = signal<boolean>(false);
  readonly clockStyle = signal<'seven-segment' | 'neon' | 'flip' | 'matrix'>('seven-segment');
  readonly selectedThemeColor = signal<string>('#00f0ff');

  // Computed time parts
  readonly hours = computed(() => {
    let h = this.currentTime().getHours();
    if (!this.is24Hour()) {
      h = h % 12 || 12;
    }
    return h.toString().padStart(2, '0');
  });

  readonly minutes = computed(() => 
    this.currentTime().getMinutes().toString().padStart(2, '0')
  );

  readonly seconds = computed(() => 
    this.currentTime().getSeconds().toString().padStart(2, '0')
  );

  readonly milliseconds = computed(() => 
    Math.floor(this.currentTime().getMilliseconds() / 10).toString().padStart(2, '0')
  );

  readonly ampm = computed(() => 
    this.currentTime().getHours() >= 12 ? 'PM' : 'AM'
  );

  readonly formattedDate = computed(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(this.currentTime());
  });

  toggleFormat(): void {
    this.is24Hour.update(val => !val);
  }

  toggleSeconds(): void {
    this.showSeconds.update(val => !val);
  }

  ngOnInit(): void {
    this.clockService.start();
  }

  ngOnDestroy(): void {
    this.clockService.stop();
  }
}`;

  const templateHtml = `<!-- digital-clock.component.html -->
<main class="clock-station-container" [style.--glow-color]="selectedThemeColor()">
  <div class="hud-header">
    <div class="brand">
      <span class="indicator live"></span>
      <span class="title">ANGULAR TS DIGITAL TIME STATION</span>
    </div>
    <div class="date-badge">
      {{ formattedDate() }}
    </div>
  </div>

  <!-- Giant Digital Display Display Box -->
  <section class="display-stage" [ngClass]="clockStyle()">
    <!-- Hours -->
    <div class="digit-pair">
      <app-seven-segment [digit]="hours()[0]" [color]="selectedThemeColor()"></app-seven-segment>
      <app-seven-segment [digit]="hours()[1]" [color]="selectedThemeColor()"></app-seven-segment>
    </div>

    <!-- Pulsing Colon -->
    <div class="colon-divider">
      <span class="dot"></span>
      <span class="dot"></span>
    </div>

    <!-- Minutes -->
    <div class="digit-pair">
      <app-seven-segment [digit]="minutes()[0]" [color]="selectedThemeColor()"></app-seven-segment>
      <app-seven-segment [digit]="minutes()[1]" [color]="selectedThemeColor()"></app-seven-segment>
    </div>

    <!-- Seconds (Optional) -->
    <ng-container *ngIf="showSeconds()">
      <div class="colon-divider">
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <div class="digit-pair">
        <app-seven-segment [digit]="seconds()[0]" [color]="selectedThemeColor()"></app-seven-segment>
        <app-seven-segment [digit]="seconds()[1]" [color]="selectedThemeColor()"></app-seven-segment>
      </div>
    </ng-container>

    <!-- AM / PM Marker -->
    <div *ngIf="!is24Hour()" class="ampm-flag">
      {{ ampm() }}
    </div>
  </section>

  <!-- Control Controls HUD -->
  <footer class="toolbar">
    <button (click)="toggleFormat()" class="btn">
      {{ is24Hour() ? 'Switch to 12H' : 'Switch to 24H' }}
    </button>
    <button (click)="toggleSeconds()" class="btn">
      Toggle Seconds
    </button>
  </footer>
</main>`;

  const serviceTs = `// clock.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClockService {
  readonly currentTime = signal<Date>(new Date());
  private timerId: any = null;

  start(): void {
    this.update();
    // 50ms interval provides smooth precision for milliseconds & clock sync
    this.timerId = setInterval(() => {
      this.update();
    }, 50);
  }

  stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private update(): void {
    this.currentTime.set(new Date());
  }
}`;

  const stylesScss = `// digital-clock.component.scss
.clock-station-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(circle at 50% 30%, #0d131f 0%, #04060a 100%);
  color: #fff;
  font-family: 'Orbitron', monospace;

  .display-stage {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 3rem 4rem;
    background: rgba(10, 15, 26, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.5rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(0, 240, 255, 0.05);
  }

  .colon-divider {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    animation: colonBlink 1s infinite cubic-bezier(0.4, 0, 0.6, 1);

    .dot {
      width: 1rem;
      height: 1rem;
      border-radius: 4px;
      background-color: var(--glow-color, #00f0ff);
      box-shadow: 0 0 16px var(--glow-color, #00f0ff);
    }
  }
}

@keyframes colonBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.15; }
}`;

  const codeMap = {
    component: componentTs,
    template: templateHtml,
    service: serviceTs,
    module: stylesScss,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeMap[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1017] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090d15]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Angular 18+ TypeScript Implementation
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                  Signals + Standalone
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ready-to-use production Angular TypeScript source code with reactive signals & services
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#0e1420] border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('component')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'component'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              digital-clock.component.ts
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'template'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              digital-clock.component.html
            </button>
            <button
              onClick={() => setActiveTab('service')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'service'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              clock.service.ts
            </button>
            <button
              onClick={() => setActiveTab('module')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'module'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              digital-clock.component.scss
            </button>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy File</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content View */}
        <div className="flex-1 overflow-auto p-6 bg-[#070a0f] text-slate-200 font-mono text-xs sm:text-sm leading-relaxed">
          <pre className="whitespace-pre overflow-x-auto select-text font-jetbrains">
            <code>{codeMap[activeTab]}</code>
          </pre>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#090d15] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Architecture: Angular 17/18 Standalone, Signals (`signal()`, `computed()`), OnPush Strategy</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
          >
            Back to Live Clock
          </button>
        </div>
      </div>
    </div>
  );
};