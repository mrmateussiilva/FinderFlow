/**
 * Embedded CSS styles for Shadow DOM isolation
 */
export const styles = `
/* Reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* CRM Sidebar */
.crm-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: #ffffff;
  border-left: 1px solid #e0e0e0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.crm-sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.crm-sidebar-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.crm-sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.crm-field {
  margin-bottom: 24px;
}

.crm-field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.crm-field select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.crm-field select:hover {
  border-color: #9ca3af;
}

.crm-field select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.crm-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
  min-height: 32px;
}

.crm-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.crm-tag-remove {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.crm-tag-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

.crm-tag-input {
  display: flex;
  gap: 8px;
}

.crm-tag-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
}

.crm-tag-input input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.crm-tag-input button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.crm-tag-input button:hover {
  background: #2563eb;
}

.crm-field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
}

.crm-field textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Floating Button Container */
.crm-floating-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9998;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

/* Floating Button */
.crm-floating-button {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}

.crm-floating-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.crm-floating-button:active {
  transform: scale(0.95);
}

/* Floating Menu */
.crm-floating-menu {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 220px;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.crm-menu-item {
  width: 100%;
  padding: 14px 18px;
  background: white;
  border: none;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.crm-menu-item:last-child {
  border-bottom: none;
}

.crm-menu-item:hover {
  background: #f9fafb;
}

/* Modal */
.crm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.crm-modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.crm-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.crm-modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.crm-modal-close {
  background: none;
  border: none;
  font-size: 32px;
  color: #6b7280;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.crm-modal-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

/* Kanban Board */
.kanban-board {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 24px;
  overflow-x: auto;
}

.kanban-column {
  background: #f9fafb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-width: 280px;
}

.kanban-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.kanban-column-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.kanban-column-count {
  background: #e5e7eb;
  color: #6b7280;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.kanban-column-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
}

/* Kanban Card */
.kanban-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: grab;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card.dragging {
  opacity: 0.5;
}

.kanban-card-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.kanban-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.kanban-card-tag {
  display: inline-block;
  padding: 3px 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.kanban-card-notes {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin-top: 8px;
}

/* Scrollbar styling */
.crm-sidebar-content::-webkit-scrollbar,
.kanban-column-content::-webkit-scrollbar {
  width: 6px;
}

.crm-sidebar-content::-webkit-scrollbar-track,
.kanban-column-content::-webkit-scrollbar-track {
  background: transparent;
}

.crm-sidebar-content::-webkit-scrollbar-thumb,
.kanban-column-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.crm-sidebar-content::-webkit-scrollbar-thumb:hover,
.kanban-column-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
`;
