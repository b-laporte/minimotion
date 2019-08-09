<script context="module">
  export const instances = [];
</script>

<script>
  import { onMount } from "svelte";
  export let animation;
  const instance = {};
  $: {
    instance.animation = animation;
  }

  onMount(() => {
    instances.push(instance);
    return () => {
      const index = instances.indexOf(instance);
      if (index > -1) {
        instances.splice(index, 1);
      }
    };
  });
</script>
