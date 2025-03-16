Senior Fullstack Developer Test Response

Task 1: Bulk Send Feature

Assumptions:
- Asynchronous Message Processing (BullMQ/Redis):
    - Assumed bulk operations could involve large numbers of tickets, risking timeouts if processed synchronously.
    - Chose BullMQ for scalable handling of large-scale asynchronous tasks, ensuring jobs continue even if frontend disconnects.

- WebSockets (Socket.IO):
    - Assumed operators require immediate, continuous feedback on bulk operations.
    - Selected WebSockets (Socket.IO) to facilitate real-time, low-latency updates, enhancing responsiveness and user experience.

Implementation Approach:

Backend:
- Created new endpoint (POST /api/v1/tickets/bulk-reply) to handle bulk reply requests, enqueuing jobs via BullMQ (Redis).
- Utilized BulkReplyWorkerService in a dedicated Docker container for reliable asynchronous job handling.
- Developed a separate Notification Microservice (JobNotificationSocket) running in its own Docker container using Socket.IO to provide real-time job progress updates.
- Implemented concurrent job execution with configurable concurrency limits.

Frontend:
- Enhanced UI for individual and bulk ("Select All") ticket selection in TicketsListComponent.
- Created a user-friendly BulkReplyComponent modal for operators to send bulk replies.
- Implemented dedicated JobNotificationComponent for interactive job status tracking.
- Integrated WebSockets (JobWebSocketService) connecting to the backend notification microservice for real-time updates.
- Centralized management of bulk operation statuses via the JobStateService using RxJS.

---

Task 2: Component Refactoring (Single Responsibility Principle)

Issue:
Original TicketComponent had multiple unrelated responsibilities, violating SRP.

Refactoring Approach:
Split responsibilities clearly among components:
- TicketContainerComponent: Centralizes ticket data fetching and orchestrates interactions between sub-components.
- TicketDetailsComponent: Displays ticket metadata and manages UI state.
- TicketMessagesComponent: Responsible solely for fetching and rendering ticket messages.
- TicketActionsComponent: Handles interactions and logic associated with the message form.

Benefits:
- Improved maintainability, clarity, modularity, and testability.
- Clear separation of concerns ensures easier debugging and future enhancements.

---

Task 3: Bug Fix – Multiple API Requests

Issue:
Redundant HTTP requests triggered by multiple async pipe subscriptions in the template.

Solution:
- Implemented RxJS shareReplay(1) operator to cache observable responses, eliminating duplicate API calls.
- Centralized observable management within TicketContainerComponent, effectively coordinating data flow and reducing backend load.

Benefits:
- Enhanced frontend performance and reduced unnecessary backend load.
- Streamlined component data management for optimal efficiency.
