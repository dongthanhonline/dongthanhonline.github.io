Hi [SupportMember],

cc [Relator1] [Relator2]

Here is my investigation and proposed action plan for this data merge issue.

**Context:** Two customers were previously merged into a single profile and need to be split.

* Client 1 (Requester): **[Client 1 Name]** (Requested information split)
* Client 2 (Original Owner): **[Client 2 Name]**

The following records are currently aggregated under `CustomerID = [CustomerID]` and need to be separated:

| Field | Merged Values in DB | Belongs to [Client 1 Name] | Belongs to [Client 2 Name] | Action for CustomerID [CustomerID] |
| --- | --- | --- | --- | --- |
| **Email** | [Merged Emails] | [Client 1 Email] | [Client 2 Email] | [Action for Email] |
| **Phone** | [Merged Phones] | [Client 1 Phone] | [Client 2 Phone] | Remove [Client 1 Phone] |
| **Pets** | [Merged Pets] | [Client 1 Pets] | [Client 2 Pets] | Remove [Client 1 Pets] |
| **Payment** | [Merged Payments] | [Client 1 Payment] | [Client 2 Payment] | Remove [Client 1 Payment] |


**Note:** Since the current email is populated with [Client B]'s Recurly account code, a **new profile must be created for [Client A Name]** to re-associate her data properly.
#### Action Items

**1. Recurly:** Update profile for [Recurly Account]

* **Remove Card:** Need [SupportMember] to remove payment method `[Client 1]'s card: lastfour-[XXXX]` from account `[Recurly Account URL]`
* **Cancel Subscription:** Need [SupportMember] to cancel the active subscription: `[Subscription URL]`
* **Refund:** Need [SupportMember] to process a refund for any incorrect subscription charges after reviewing transaction history.

**2. Vetspire:** Update profile for [Vetspire ID]|Already updated and verified. No further action needed.

* Need [SupportMember] to update phone `[Client 1 Phone]`
* Need [SupportMember] to remove pet `[Client 1 Pets]`

**3. Alex Database:** Need [DatabaseTeam] to cleanup data for CustomerID = [CustomerID]

* Remove phones: `[Client 1 Phone]`
* Remove emails: `[Client 1 Email]`
* Soft delete pets: `[Client 1 Name]`'s pets (`[Client 1 Pets]`)
* Remove payment info: `[Client 1]'s card: lastfour-[XXXX]`

**4. Re-enrollment**

* Need [SupportMember] to reach out to `[Client 1 Name]` and assist her/him with re-enrolling her subscription.
