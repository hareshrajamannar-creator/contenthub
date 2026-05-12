import type { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/test'
import { RecommendationsView } from '@/app/components/recommendations/RecommendationsView'

const meta: Meta<typeof RecommendationsView> = {
  title: 'App/RecommendationsView',
  component: RecommendationsView,
}
export default meta

type Story = StoryObj<typeof RecommendationsView>

export const Default: Story = { args: {} }

export const FAQDetail: Story = { args: { initialRecId: 'faq-rec-001' } }

export const EvidenceTab: Story = {
  name: 'Evidence tab',
  args: { initialRecId: '69de016e9c10756b6b61329f' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Evidence' }))
  },
}
