import type { Meta, StoryObj } from '@storybook/react'
import { RecommendationsView } from '@/app/components/recommendations/RecommendationsView'

const meta: Meta<typeof RecommendationsView> = {
  title: 'App/RecommendationsView',
  component: RecommendationsView,
}
export default meta

type Story = StoryObj<typeof RecommendationsView>

export const Default: Story = { args: {} }

export const FAQDetail: Story = { args: { initialRecId: 'faq-rec-001' } }
