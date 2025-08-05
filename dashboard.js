class Dashboard {
    constructor() {
        // Use relative API URLs for Vercel deployment
        this.apiUrl = '/api';
        this.conversations = [];
        this.filteredConversations = [];
        this.selectedConversation = null;
        this.filters = {
            industry: '',
            consultation: '',
            leadQuality: ''
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadConversations();
    }
    
    initializeElements() {
        this.conversationsList = document.getElementById('conversationsList');
        this.conversationDetail = document.getElementById('conversationDetail');
        this.detailTitle = document.getElementById('detailTitle');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.backToChatBtn = document.getElementById('backToChat');
        this.closeDetailBtn = document.getElementById('closeDetail');
        
        // Filter elements
        this.industryFilter = document.getElementById('industryFilter');
        this.consultationFilter = document.getElementById('consultationFilter');
        this.leadQualityFilter = document.getElementById('leadQualityFilter');
        this.clearFiltersBtn = document.getElementById('clearFilters');
    }
    
    setupEventListeners() {
        this.backToChatBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
        
        this.closeDetailBtn.addEventListener('click', () => {
            this.hideConversationDetail();
        });
        
        // Filter event listeners
        this.industryFilter.addEventListener('change', () => {
            this.filters.industry = this.industryFilter.value;
            this.applyFilters();
        });
        
        this.consultationFilter.addEventListener('change', () => {
            this.filters.consultation = this.consultationFilter.value;
            this.applyFilters();
        });
        
        this.leadQualityFilter.addEventListener('change', () => {
            this.filters.leadQuality = this.leadQualityFilter.value;
            this.applyFilters();
        });
        
        this.clearFiltersBtn.addEventListener('click', () => {
            this.clearFilters();
        });
    }
    
    async loadConversations() {
        try {
            this.showLoading();
            
            const response = await fetch(`${this.apiUrl}/conversations`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.conversations = data.conversations || [];
            
            this.populateIndustryFilter();
            this.applyFilters();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.showError('Failed to load conversations. Please try again.');
            this.hideLoading();
        }
    }
    
    renderConversations() {
        const conversationsToRender = this.filteredConversations.length > 0 ? this.filteredConversations : this.conversations;
        
        if (conversationsToRender.length === 0) {
            this.conversationsList.innerHTML = `
                <div class="empty-state">
                    <h3>No conversations found</h3>
                    <p>${this.filteredConversations.length === 0 && this.conversations.length > 0 ? 'No conversations match the current filters.' : 'Start a new conversation to see it here.'}</p>
                </div>
            `;
            return;
        }
        
        this.conversationsList.innerHTML = conversationsToRender
            .map(conversation => this.createConversationCard(conversation))
            .join('');
        
        // Add click listeners to conversation cards
        this.conversationsList.querySelectorAll('.conversation-card').forEach((card, index) => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on delete button or analyze button
                if (!e.target.classList.contains('delete-btn') && !e.target.classList.contains('analyze-btn')) {
                    this.selectConversation(conversationsToRender[index]);
                }
            });
        });
        
        // Add click listeners to analyze buttons
        this.conversationsList.querySelectorAll('.analyze-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering conversation selection
                const conversationId = btn.getAttribute('data-id');
                this.analyzeConversation(conversationId);
            });
        });
        
        // Add click listeners to delete buttons
        this.conversationsList.querySelectorAll('.delete-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering conversation selection
                const conversationId = btn.getAttribute('data-id');
                this.deleteConversation(conversationId);
            });
        });
    }
    
    createConversationCard(conversation) {
        const createdAt = new Date(conversation.created_at);
        const formattedTime = this.formatDateTime(createdAt);
        const messageCount = conversation.messages ? conversation.messages.length : 0;
        const preview = this.getConversationPreview(conversation.messages);
        
        // Check if analysis exists
        const hasAnalysis = conversation.customer_analysis;
        const leadQuality = hasAnalysis ? conversation.customer_analysis.leadQuality : null;
        const analysisTimestamp = conversation.analysis_timestamp;
        
        return `
            <div class="conversation-card" data-id="${conversation.conversation_id}">
                <div class="conversation-content">
                    <div class="conversation-id">${conversation.conversation_id}</div>
                    <div class="conversation-time">${formattedTime}</div>
                    <div class="conversation-preview">${preview}</div>
                    <div class="message-count">${messageCount} messages</div>
                    ${hasAnalysis ? `
                        <div class="analysis-status">
                            <span class="lead-quality ${leadQuality}">${leadQuality}</span>
                            <span class="analysis-time">Analyzed ${this.formatDateTime(new Date(analysisTimestamp))}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="action-buttons">
                    <button class="analyze-btn" data-id="${conversation.conversation_id}" title="Analyze customer data" ${hasAnalysis ? 'disabled' : ''}>
                        ${hasAnalysis ? '✅' : '🔍'}
                    </button>
                    <button class="delete-btn" data-id="${conversation.conversation_id}" title="Delete conversation">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }
    
    getConversationPreview(messages) {
        if (!messages || messages.length === 0) {
            return 'No messages';
        }
        
        // Get the first user message or bot message
        const firstMessage = messages.find(msg => msg.role === 'user') || 
                           messages.find(msg => msg.role === 'assistant') || 
                           messages[0];
        
        return firstMessage ? firstMessage.content.substring(0, 100) + '...' : 'No preview available';
    }
    
    async selectConversation(conversation) {
        try {
            // Update active state
            document.querySelectorAll('.conversation-card').forEach(card => {
                card.classList.remove('active');
            });
            
            const activeCard = document.querySelector(`[data-id="${conversation.conversation_id}"]`);
            if (activeCard) {
                activeCard.classList.add('active');
            }
            
            this.selectedConversation = conversation;
            this.detailTitle.textContent = `Conversation: ${conversation.conversation_id}`;
            
            // Render messages and analysis
            this.renderMessages(conversation.messages);
            this.renderAnalysis(conversation.customer_analysis);
            this.showConversationDetail();
            
        } catch (error) {
            console.error('Error selecting conversation:', error);
            this.showError('Failed to load conversation details.');
        }
    }
    
    renderMessages(messages) {
        if (!messages || messages.length === 0) {
            this.messagesContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No messages in this conversation</h3>
                </div>
            `;
            return;
        }
        
        this.messagesContainer.innerHTML = messages
            .filter(message => message.role === 'user' || message.role === 'assistant')
            .map(message => this.createMessageElement(message))
            .join('');
        
        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    createMessageElement(message) {
        const isUser = message.role === 'user';
        const timestamp = message.timestamp ? this.formatTime(new Date(message.timestamp)) : '';
        
        return `
            <div class="message-item ${isUser ? 'user' : 'bot'}">
                <div class="message-avatar ${isUser ? 'user-avatar' : 'bot-avatar'}">
                    ${isUser ? 'U' : 'AI'}
                </div>
                <div class="message-content">
                    ${this.escapeHtml(message.content)}
                    ${timestamp ? `<div class="message-time">${timestamp}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatDateTime(date) {
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } else if (diffInHours < 48) {
            return 'Yesterday at ' + date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
        }
    }
    
    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }
    
    showConversationDetail() {
        this.conversationDetail.style.display = 'flex';
    }
    
    hideConversationDetail() {
        this.conversationDetail.style.display = 'none';
        document.querySelectorAll('.conversation-card').forEach(card => {
            card.classList.remove('active');
        });
        this.selectedConversation = null;
    }
    
    showLoading() {
        this.loadingSpinner.style.display = 'flex';
    }
    
    hideLoading() {
        this.loadingSpinner.style.display = 'none';
    }
    
    async analyzeConversation(conversationId) {
        try {
            // Show loading state
            const analyzeBtn = document.querySelector(`[data-id="${conversationId}"] .analyze-btn`);
            if (analyzeBtn) {
                analyzeBtn.disabled = true;
                analyzeBtn.textContent = '⏳';
            }
            
            const response = await fetch(`${this.apiUrl}/analyze/${conversationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update the conversation in local array
            const conversationIndex = this.conversations.findIndex(conv => conv.conversation_id === conversationId);
            if (conversationIndex !== -1) {
                this.conversations[conversationIndex].customer_analysis = data.analysis;
            }
            
            // Update industry filter options
            this.populateIndustryFilter();
            
            // Re-apply filters and render
            this.applyFilters();
            
            // Show success message
            alert('Customer analysis completed successfully!');
            
        } catch (error) {
            console.error('Error analyzing conversation:', error);
            alert('Failed to analyze conversation. Please try again.');
        }
    }
    
    async deleteConversation(conversationId) {
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/conversation/${conversationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Remove from local array
            this.conversations = this.conversations.filter(conv => conv.conversation_id !== conversationId);
            
            // Re-render the list
            this.renderConversations();
            
            // If the deleted conversation was selected, hide the detail view
            if (this.selectedConversation && this.selectedConversation.conversation_id === conversationId) {
                this.hideConversationDetail();
            }
            
        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert('Failed to delete conversation. Please try again.');
        }
    }
    
    renderAnalysis(analysis) {
        const analysisContainer = document.getElementById('analysisContainer');
        if (!analysisContainer) return;
        
        if (!analysis) {
            analysisContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No Analysis Available</h3>
                    <p>Click the analyze button to extract customer information.</p>
                </div>
            `;
            return;
        }
        
        const leadQualityClass = analysis.leadQuality || 'unknown';
        
        analysisContainer.innerHTML = `
            <div class="analysis-header">
                <h3>Customer Analysis</h3>
                <span class="lead-quality-badge ${leadQualityClass}">${analysis.leadQuality || 'Unknown'}</span>
            </div>
            <div class="analysis-content">
                <div class="analysis-section">
                    <h4>Contact Information</h4>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <label>Name:</label>
                            <span>${analysis.customerName || 'Not provided'}</span>
                        </div>
                        <div class="analysis-item">
                            <label>Email:</label>
                            <span>${analysis.customerEmail || 'Not provided'}</span>
                        </div>
                        <div class="analysis-item">
                            <label>Phone:</label>
                            <span>${analysis.customerPhone || 'Not provided'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>Business Information</h4>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <label>Industry:</label>
                            <span>${analysis.customerIndustry || 'Not specified'}</span>
                        </div>
                        <div class="analysis-item">
                            <label>Problems/Needs:</label>
                            <span>${analysis.customerProblem || 'Not specified'}</span>
                        </div>
                        <div class="analysis-item">
                            <label>Availability:</label>
                            <span>${analysis.customerAvailability || 'Not specified'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>Engagement</h4>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <label>Consultation Booked:</label>
                            <span class="consultation-status ${analysis.customerConsultation ? 'booked' : 'not-booked'}">
                                ${analysis.customerConsultation ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>
                
                ${analysis.specialNotes ? `
                    <div class="analysis-section">
                        <h4>Special Notes</h4>
                        <div class="analysis-notes">
                            ${analysis.specialNotes}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    showError(message) {
        this.conversationsList.innerHTML = `
            <div class="empty-state">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
    
    // Filter methods
    populateIndustryFilter() {
        const industries = new Set();
        
        this.conversations.forEach(conversation => {
            if (conversation.customer_analysis && conversation.customer_analysis.customerIndustry) {
                industries.add(conversation.customer_analysis.customerIndustry);
            }
        });
        
        // Clear existing options except the first one
        this.industryFilter.innerHTML = '<option value="">All Industries</option>';
        
        // Add industry options
        industries.forEach(industry => {
            const option = document.createElement('option');
            option.value = industry;
            option.textContent = industry;
            this.industryFilter.appendChild(option);
        });
    }
    
    applyFilters() {
        this.filteredConversations = this.conversations.filter(conversation => {
            const analysis = conversation.customer_analysis;
            
            // Industry filter
            if (this.filters.industry && analysis && analysis.customerIndustry) {
                if (analysis.customerIndustry !== this.filters.industry) {
                    return false;
                }
            }
            
            // Consultation filter
            if (this.filters.consultation && analysis) {
                const consultationBooked = analysis.customerConsultation;
                if (this.filters.consultation === 'true' && !consultationBooked) {
                    return false;
                }
                if (this.filters.consultation === 'false' && consultationBooked) {
                    return false;
                }
            }
            
            // Lead quality filter
            if (this.filters.leadQuality && analysis && analysis.leadQuality) {
                if (analysis.leadQuality !== this.filters.leadQuality) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.renderConversations();
    }
    
    clearFilters() {
        this.filters = {
            industry: '',
            consultation: '',
            leadQuality: ''
        };
        
        this.industryFilter.value = '';
        this.consultationFilter.value = '';
        this.leadQualityFilter.value = '';
        
        this.applyFilters();
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
}); 