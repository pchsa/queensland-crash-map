import { Checkbox, Group } from '@mantine/core';

function SeveritySelect() {
  return (
    <Checkbox.Group
      defaultValue={['react', 'svelte', 'ng', 'vue']}
      label="Select your favorite frameworks/libraries"
      description="This is anonymous"
      withAsterisk
      
    >
      <Group mt="xs">
        <Checkbox value="react" label="React" />
        <Checkbox value="svelte" label="Svelte" />
        <Checkbox value="ng" label="Angular" />
        <Checkbox disabled={false} value="vue" label="Vue" />
      </Group>
    </Checkbox.Group>
  );
}

export default SeveritySelect;