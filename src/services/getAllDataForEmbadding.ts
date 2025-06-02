// Dummy data for testing embeddings
export const dummyKnowledgeBase = [
  {
    title: "CRM Best Practices",
    content: `Customer Relationship Management (CRM) best practices include:

1. Data Quality Management: Ensure all customer data is accurate, complete, and up-to-date. Regular data cleaning and validation processes are essential.

2. Lead Scoring: Implement a systematic approach to score and prioritize leads based on their likelihood to convert. Consider factors like engagement level, company size, and budget.

3. Sales Pipeline Management: Maintain a clear, well-defined sales pipeline with distinct stages. Track conversion rates between stages to identify bottlenecks.

4. Customer Segmentation: Group customers based on characteristics like industry, company size, purchasing behavior, and engagement level to provide personalized experiences.

5. Follow-up Automation: Set up automated follow-up sequences for leads and customers to ensure consistent communication and reduce manual tasks.

6. Performance Analytics: Regularly analyze sales metrics, customer lifetime value, conversion rates, and team performance to make data-driven decisions.`,
    type: "knowledge",
    source: "manual",
  },
  {
    title: "Common Sales Objections and Responses",
    content: `Here are common sales objections and how to handle them:

"It's too expensive"
- Response: "I understand budget is a concern. Let's look at the ROI and value this solution provides. What specific budget constraints are you working with?"

"We need to think about it"
- Response: "I appreciate you want to make a thoughtful decision. What specific aspects would you like to discuss further? Perhaps I can address any concerns now."

"We're happy with our current solution"
- Response: "That's great to hear you're satisfied. What would it take for a solution to be significantly better than what you have now?"

"We don't have time to implement this"
- Response: "Implementation time is definitely important. Our solution is designed for quick deployment. What's your ideal timeline, and how can we work within it?"

"I need to check with my team/boss"
- Response: "Of course, involving key stakeholders is important. Would it be helpful if I joined that conversation to answer any technical questions they might have?"`,
    type: "knowledge",
    source: "manual",
  },
  {
    title: "Customer Onboarding Process",
    content: `Our customer onboarding process ensures smooth transitions and early success:

Week 1: Welcome and Setup
- Send welcome email with onboarding checklist
- Schedule kickoff call with customer success manager
- Provide access to customer portal and training resources
- Collect necessary account information and preferences

Week 2: Training and Configuration
- Conduct product training sessions for key users
- Configure system settings based on customer requirements
- Set up integrations with existing tools
- Establish communication preferences and check-in schedule

Week 3: Go-Live Support
- Assist with initial data migration and setup
- Provide hands-on support during first week of usage
- Monitor system performance and user adoption
- Address any immediate concerns or questions

Week 4: Review and Optimization
- Conduct 30-day review meeting
- Analyze usage patterns and identify optimization opportunities
- Provide additional training for advanced features
- Establish long-term success metrics and goals`,
    type: "procedure",
    source: "manual",
  },
  {
    title: "Product Pricing Tiers",
    content: `Our CRM solution offers three pricing tiers to meet different business needs:

Starter Plan ($29/user/month):
- Up to 1,000 contacts
- Basic lead management
- Email integration
- Standard reporting
- Email support

Professional Plan ($59/user/month):
- Up to 10,000 contacts
- Advanced automation workflows
- Custom fields and dashboards
- Advanced reporting and analytics
- Priority phone and email support
- API access

Enterprise Plan ($99/user/month):
- Unlimited contacts
- Advanced security features
- Custom integrations
- Dedicated customer success manager
- Advanced analytics and forecasting
- 24/7 phone support
- Training and onboarding assistance

All plans include:
- Mobile app access
- Data backup and security
- 99.9% uptime guarantee
- 30-day free trial`,
    type: "knowledge",
    source: "manual",
  },
  {
    title: "Data Security and Privacy Policy",
    content: `We take data security and privacy seriously:

Data Encryption:
- All data is encrypted in transit using TLS 1.3
- Data at rest is encrypted using AES-256 encryption
- Database backups are encrypted and stored securely

Access Controls:
- Role-based access controls limit data access
- Two-factor authentication is required for all admin accounts
- Regular access reviews and audit logs are maintained

Compliance:
- GDPR compliant for European customers
- SOC 2 Type II certified
- Regular security audits and penetration testing
- CCPA compliant for California residents

Data Retention:
- Customer data is retained as long as account is active
- Data can be exported or deleted upon request
- Backup data is retained for 90 days after account closure
- Audit logs are retained for 7 years for compliance

Privacy Rights:
- Customers can request data access, correction, or deletion
- We do not sell or share personal data with third parties
- Marketing communications can be opted out at any time`,
    type: "policy",
    source: "manual",
  },
];

// Function to get all dummy data
export const getAllDummyData = () => {
  return dummyKnowledgeBase;
};

// Function to get dummy data by type
export const getDummyDataByType = (type: string) => {
  return dummyKnowledgeBase.filter((item) => item.type === type);
};

// Function to search dummy data
export const searchDummyData = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return dummyKnowledgeBase.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.content.toLowerCase().includes(lowerQuery)
  );
};
