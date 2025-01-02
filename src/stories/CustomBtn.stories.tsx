import type { Meta, StoryObj } from '@storybook/react';
import { CustomBtn } from '@/components';

const meta = {
  title: 'Components/CustomBtn',
  component: CustomBtn,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['default', 'primary', 'link', 'text'] },
    backgroundColor: { control: 'color' },
  },
  args: {
    onClick: () => alert('Button clicked!'),
  },
} satisfies Meta<typeof CustomBtn>;

export default meta;
type Story = StoryObj<typeof meta>;


export const Primary: Story = {
  args: {
    title: 'Primary Button',
    type: 'primary',
    loading: false,
  },
};


export const Secondary: Story = {
  args: {
    title: 'Secondary Button',
    type: 'default',
    loading: false,
  },
};

export const Large: Story = {
  args: {
    title: 'Large Button',
    className: 'w-full h-16',
    type: 'primary',
    loading: false,
  },
};


export const Small: Story = {
  args: {
    title: 'Small Button',
    className: 'w-full h-8',
    type: 'primary',
    loading: false,
  },
};
