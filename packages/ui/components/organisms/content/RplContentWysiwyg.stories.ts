import type { Meta, StoryObj } from '@storybook/vue3'
import RplContentWysiwyg from './RplContentWysiwyg.vue'

const meta: Meta<typeof RplContentWysiwyg> = {
  title: 'Organisms/Content/RplContentWysiwyg',
  component: RplContentWysiwyg,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof RplContentWysiwyg>

export const Default: Story = {
  args: {
    html: `
      <h2>About this service</h2>
      <p>The Victorian Government provides a range of services to support communities across the state. This page outlines the key information you need to know.</p>
      <h3>Eligibility</h3>
      <p>To be eligible for this service, you must:</p>
      <ul>
        <li>Be a Victorian resident</li>
        <li>Be aged 18 years or over</li>
        <li>Hold a valid form of identification</li>
      </ul>
      <p>For more information, <a href="#">contact us</a>.</p>
    `
  }
}

export const WithTable: Story = {
  args: {
    html: `
      <h2>Fee Schedule</h2>
      <p>The following fees apply for the 2026–27 financial year:</p>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Standard Fee</th>
            <th>Concession Fee</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Application processing</td>
            <td>$120.00</td>
            <td>$60.00</td>
          </tr>
          <tr>
            <td>Annual renewal</td>
            <td>$85.00</td>
            <td>$42.50</td>
          </tr>
          <tr>
            <td>Late fee</td>
            <td>$30.00</td>
            <td>$15.00</td>
          </tr>
        </tbody>
      </table>
    `
  }
}

export const WithBlockquote: Story = {
  args: {
    html: `
      <h2>Minister's Statement</h2>
      <blockquote>
        <p>This initiative represents a significant step forward in our commitment to providing accessible, high-quality services to all Victorians. We are proud to deliver on this promise.</p>
      </blockquote>
      <p>The Minister made this statement at the launch event on 15 February 2026.</p>
    `
  }
}

export const RichContent: Story = {
  args: {
    html: `
      <h2>Getting Started</h2>
      <p>Follow these steps to complete your registration:</p>
      <ol>
        <li>Create an account on the Service Victoria portal</li>
        <li>Verify your identity using one of the accepted methods</li>
        <li>Complete the online application form</li>
        <li>Upload required supporting documents</li>
        <li>Submit your application and receive a confirmation number</li>
      </ol>
      <h3>Required Documents</h3>
      <p>You will need the following documents ready before you begin:</p>
      <ul>
        <li>Proof of identity (passport, driver licence, or birth certificate)</li>
        <li>Proof of address (utility bill or bank statement dated within 3 months)</li>
        <li>Any relevant certificates or qualifications</li>
      </ul>
      <p><strong>Note:</strong> All documents must be in English or accompanied by a certified translation.</p>
      <img src="https://placehold.co/600x200/f5f5f5/333333?text=Example+Document" alt="Example of an accepted document" />
      <p>If you need assistance, call <strong>1300 000 000</strong> or visit your nearest service centre.</p>
    `
  }
}
