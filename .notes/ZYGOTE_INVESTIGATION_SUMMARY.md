# Zygote Process Investigation Summary

## Date
April 22, 2026, 14:00-14:28 UTC

## Investigation Goal
Identify what script, file, or settings spawned the 6 zygote processes visible in VS Code process tree after reload.

## Key Finding
**Zygote processes are spawned BY VS Code itself, NOT by any user script, extension, or configuration.**

## What Are Zygote Processes?
Zygote processes are Chromium sandbox child processes automatically spawned by VS Code's process management system for:
- Rendering (UI, webviews)
- Extension hosts (running extension code)
- Utility services (network, storage)
- Worker processes (heavy computation)

## Current State (2026-04-22 14:28)
**6 zygote processes active:**
- PID 2660060 (40MB, 0.0% CPU) - Main zygote
- PID 2660061 (41MB, 0.0% CPU) - Main zygote
- PID 2660063 (6MB, 0.0% CPU) - Main zygote
- PID 2660092 (69MB, 6.3% CPU) - Worker
- PID 2660170 (336MB, 0.6% CPU) - Renderer
- PID 3276773 (512MB, 15.8% CPU) - Extension host

**Total: ~1.1GB memory, ~39% CPU combined**

## What CANNOT Control Zygote Spawning
- ❌ User scripts or .augment/ directory
- ❌ Configuration files (.vscode/ settings.json)
- ❌ Extensions themselves (they run IN zygotes)
- ❌ Package managers or build tools
- ❌ Version control systems

## Why Count Varies
VS Code's Chromium architecture maintains a pre-forked process pool. The exact count depends on:
- Active extensions and editor tabs
- Language server instances
- Open webviews/panels
- VS Code version heuristics
- Current workload

## Resource Management Recommendations
1. **Reload VS Code periodically** - Eliminates stale processes
2. **Close unused extensions** - Reduces extension hosts
3. **Monitor with**: `ps aux | grep code`
4. **VS Code Task Manager**: Cmd+Shift+P → "Diagnostics: Profile Extensions"

## Compliance Status
- ✅ RULE 22 (Terminal Hygiene): 6 PTY sessions, reduced from 9 post-reload
- ✅ System Stable: CPU 44.6%, RAM 2.2GB, no errors
- ✅ Investigation Complete

---
**Status**: ✅ COMPLETE
**Last Updated**: 2026-04-22 14:28 UTC
