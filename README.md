# Senior Fullstack Developer Test Response

## Task 1: Bulk Send Feature

### Assumptions and Rationale:
- Asynchronous Processing:
    - Assumed bulk operations could involve processing large numbers of tickets, potentially causing API timeouts or impacting frontend performance if handled synchronously.
    - Implemented an asynchronous processing solution (BullMQ/Redis) to ensure bulk operations execute efficiently, independently of frontend connectivity or browser state.

- Real-time Operator Feedback:
    - Assumed operators need immediate and continuous updates on the progress of bulk operations to maintain efficiency and situational awareness.
    - Implemented real-time communication channels (WebSockets/Socket.IO) to deliver timely job-status updates, enabling operators to track progress effortlessly without manual refreshes or page navigation.

- Scalability and Future Growth:
    - Assumed the system might scale significantly in terms of tickets and users, necessitating careful consideration of resource utilization.
    - Chose a microservices architecture with independent Docker containers for workers, notifications, and APIs to easily accommodate horizontal scaling in response to increased demand.

- Concurrency Controls:
    - Assumed efficient database resource management was critical.
    - Implemented configurable concurrency limits in the worker service to manage resources efficiently and prevent database overload.

- Authentication and Security:
    - Assumed operators should only view notifications relevant to their own initiated jobs to maintain operational clarity and data privacy.
    - Implemented filtering by operator-specific senderId during WebSocket connections, paving the way for straightforward integration of a more robust authentication layer in the future. This ensures operators currently only receive notifications pertinent to their activities, preventing inadvertent access to other operators' bulk job statuses.

- Ticket Resolution State Handling:
    - Assumed bulk replies must not modify tickets already marked as "resolved".
    - Implemented explicit checks in job processing logic, where attempts to process already-resolved tickets are safely skipped and counted explicitly as errors.

- UX Considerations (Frontend):
    - Assumed the need for immediate, intuitive visual feedback for bulk operations.
    - Chose visual highlights, notifications badges, intuitive status icons, real-time progress tooltips and interactive filters in JobNotificationComponent to deliver a clear and user-friendly experience, reducing operator cognitive load.

### Implementation Approach:

Backend:
- Created new endpoint (POST /api/v1/tickets/bulk-reply) to handle bulk reply requests, enqueuing jobs via BullMQ (Redis).
- Utilized BulkReplyWorkerService in a dedicated Docker container for reliable asynchronous job handling.
- Developed a separate Notification Microservice (JobNotificationSocket) running in its own Docker container using Socket.IO to provide real-time job progress updates.

Frontend:
- Enhanced UI for individual and bulk ("Select All") ticket selection in TicketsListComponent.
- Created a BulkReplyComponent modal for operators to send bulk replies.
- Implemented dedicated JobNotificationComponent for interactive job status tracking.
- Integrated WebSockets (JobWebSocketService) connecting to the backend notification microservice for real-time updates.
- Centralized management of bulk operation statuses via the JobStateService using RxJS.

### Simulating Multiple Operators:

By default, the frontend application initializes with senderId set to operator1.
To simulate other operators, specify the desired senderId as a query parameter in the URL.

Example usage:

Default operator:
- http://localhost:4200/home (uses operator1 by default)

Simulating another operator:
- http://localhost:4200/home?senderId=operator2

This method allows straightforward testing of real-time job notifications tailored to individual operators.

---

## Task 2: Component Refactoring (Single Responsibility Principle)

Issue:
Original TicketComponent had multiple unrelated responsibilities, violating SRP.

Refactoring Approach:
Split responsibilities clearly among components:
- TicketContainerComponent: Centralizes ticket data fetching and orchestrates interactions between sub-components.
- TicketDetailsComponent: Displays ticket metadata and manages UI state.
- TicketMessagesComponent: Responsible solely for fetching and rendering ticket messages.
- TicketMessageFormComponent: Handles interactions and logic associated with the message form.

---

## Task 3: Bug Fix – Multiple API Requests

Issue:
Redundant HTTP requests triggered by multiple async pipe subscriptions in the template.

Solution:
- Implemented RxJS shareReplay(1) operator to cache observable responses, eliminating duplicate API calls.
- Centralized observable management within TicketContainerComponent, effectively coordinating data flow and reducing backend load.
