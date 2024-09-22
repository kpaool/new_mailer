<script>
    import "../app.css";
    import { ModeWatcher } from "mode-watcher";
    import { Toaster } from "$lib/components/ui/sonner";
  </script>
  
  <Toaster />
  <ModeWatcher />
  <slot />