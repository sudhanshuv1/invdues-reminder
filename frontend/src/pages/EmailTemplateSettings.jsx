import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { 
  useGetEmailTemplateQuery,
  useUpdateEmailTemplateMutation,
  useGetMailConfigQuery
} from '../features/apiSlice';
import DashboardLayout from '../components/DashboardLayout';

const EmailTemplateSettings = () => {
  const { data: mailConfig } = useGetMailConfigQuery();
  const { data: templateData, isLoading, refetch } = useGetEmailTemplateQuery();
  const [updateTemplate] = useUpdateEmailTemplateMutation();
  
  const [useCustomTemplate, setUseCustomTemplate] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ref to track if we're currently auto-saving to prevent infinite loops
  const isAutoSavingRef = useRef(false);
  // Ref to track the initial template data to compare against
  const initialTemplateDataRef = useRef(null);
  // Ref to track if the component has finished its initial setup
  const hasInitializedRef = useRef(false);

  // Calculate isEmailConfigured at the top level
  const isEmailConfigured = mailConfig?.configured || false;

  // Update form when data loads
  useEffect(() => {
    if (templateData && !isLoading) {
      console.log('Frontend: Loading template data:', {
        rawTemplateData: templateData,
        useCustomTemplate: templateData.useCustomTemplate,
        typeOfUseCustomTemplate: typeof templateData.useCustomTemplate,
        hasInitialized: hasInitializedRef.current,
        isLoading
      });
      
      const newTemplateState = Boolean(templateData.useCustomTemplate);
      
      // Always update the form state with the latest data
      setUseCustomTemplate(newTemplateState);
      setCustomSubject(templateData.customSubject || '');
      setCustomContent(templateData.customContent || '');
      
      // Store initial data only once, when we haven't initialized yet
      if (!hasInitializedRef.current) {
        initialTemplateDataRef.current = {
          useCustomTemplate: newTemplateState,
          customSubject: templateData.customSubject || '',
          customContent: templateData.customContent || ''
        };
        console.log('Setting initial template data (first time):', initialTemplateDataRef.current);
        
        // Mark as initialized after a short delay to ensure all state updates are complete
        setTimeout(() => {
          hasInitializedRef.current = true;
          console.log('Component initialization completed');
        }, 100);
      } else {
        // If we're already initialized, just update the initial reference to match current server state
        // This handles cases where server data might have changed while we were away
        console.log('Updating initial reference to match server state:', {
          old: initialTemplateDataRef.current,
          new: { useCustomTemplate: newTemplateState }
        });
        initialTemplateDataRef.current.useCustomTemplate = newTemplateState;
        initialTemplateDataRef.current.customSubject = templateData.customSubject || '';
        initialTemplateDataRef.current.customContent = templateData.customContent || '';
      }
    }
  }, [templateData, isLoading]);

  // DEBUG: Log button state
  useEffect(() => {
    console.log('=== BUTTON STATE DEBUG ===');
    console.log('isEmailConfigured:', isEmailConfigured);
    console.log('mailConfig:', mailConfig);
    console.log('isProcessing:', isProcessing);
    console.log('Button disabled:', isProcessing || !isEmailConfigured);
    console.log('=== END BUTTON STATE DEBUG ===');
  }, [isEmailConfigured, mailConfig, isProcessing]);

  // Auto-save when useCustomTemplate changes (but not during initialization)
  useEffect(() => {
    console.log('Auto-save useEffect triggered:', {
      useCustomTemplate,
      hasInitialized: hasInitializedRef.current,
      hasInitialData: !!initialTemplateDataRef.current,
      isAutoSaving: isAutoSavingRef.current,
      initialUseCustomTemplate: initialTemplateDataRef.current?.useCustomTemplate
    });
    
    // Skip if component hasn't finished initializing
    if (!hasInitializedRef.current) {
      console.log('Skipping auto-save: Component not initialized yet');
      return;
    }
    
    // Skip if no initial data stored yet
    if (!initialTemplateDataRef.current) {
      console.log('Skipping auto-save: No initial data stored');
      return;
    }
    
    // Skip if we're currently auto-saving to prevent loops
    if (isAutoSavingRef.current) {
      console.log('Skipping auto-save: Currently auto-saving');
      return;
    }
    
    // Skip if the current state matches the initial loaded data (no change)
    if (useCustomTemplate === initialTemplateDataRef.current.useCustomTemplate) {
      console.log('Skipping auto-save: No change detected');
      return;
    }
    
    console.log('=== AUTO-SAVE CHECKBOX CHANGE ===');
    console.log('Checkbox changed from', initialTemplateDataRef.current.useCustomTemplate, 'to', useCustomTemplate);
    
    // Auto-save the checkbox change
    const autoSave = async () => {
      isAutoSavingRef.current = true;
      setIsProcessing(true);
      try {
        // For auto-save, only send the checkbox state and preserve existing content
        const saveData = {
          useCustomTemplate: Boolean(useCustomTemplate),
          customSubject: customSubject || '',
          customContent: customContent || ''
        };
        
        console.log('Auto-saving template with data:', saveData);
        const result = await updateTemplate(saveData).unwrap();
        console.log('Auto-save result:', result);
        
        // Update the initial reference to the new saved state
        initialTemplateDataRef.current.useCustomTemplate = Boolean(useCustomTemplate);
        
        // Show a subtle notification instead of alert
        console.log('✅ Template preference saved automatically');
      } catch (error) {
        console.error('Auto-save error:', error);
        // Revert the checkbox state on error
        setUseCustomTemplate(initialTemplateDataRef.current.useCustomTemplate);
        alert('Failed to save template preference: ' + (error.data?.message || error.message));
      } finally {
        setIsProcessing(false);
        isAutoSavingRef.current = false;
      }
    };
    
    autoSave();
  }, [useCustomTemplate, updateTemplate]);

  // Safe sanitization function
  const sanitizeHTML = (html) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['br', 'b', 'i', 'u', 'strong', 'em'],
      ALLOWED_ATTR: []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    console.log('=== FRONTEND FORM SUBMIT DEBUG ===');
    console.log('Form submitted with state:');
    console.log('- useCustomTemplate:', useCustomTemplate, typeof useCustomTemplate);
    console.log('- customSubject:', customSubject);
    console.log('- customContent:', customContent);
    console.log('- isEmailConfigured:', isEmailConfigured);
    console.log('- isProcessing:', isProcessing);
    
    try {
      const templateData = {
        useCustomTemplate: Boolean(useCustomTemplate),
        customSubject: customSubject || '',
        customContent: customContent || ''
      };
      
      console.log('Frontend: Submitting email template update (subject/content only):', {
        rawUseCustomTemplate: useCustomTemplate,
        convertedUseCustomTemplate: Boolean(useCustomTemplate),
        templateData
      });
      
      console.log('About to call updateTemplate mutation...');
      const result = await updateTemplate(templateData).unwrap();
      console.log('Frontend: Update result:', result);
      
      alert('Email template content updated successfully!');
      // Cache invalidation will automatically refetch the data
    } catch (error) {
      console.error('Frontend: Update error:', error);
      alert('Error updating template: ' + (error.data?.message || error.message));
    } finally {
      setIsProcessing(false);
      console.log('=== END FRONTEND FORM SUBMIT DEBUG ===');
    }
  };

  const handleReset = () => {
    // Reset to original saved values from templateData
    setUseCustomTemplate(templateData?.useCustomTemplate || false);
    setCustomSubject(templateData?.customSubject || '');
    setCustomContent(templateData?.customContent || '');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500">Loading email template settings...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold dark:text-gray-200 text-gray-800">Email Template Settings</h1>
          <p className="dark:text-gray-300 text-gray-600 mt-1">Customize your reminder email templates</p>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {!isEmailConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">
                  ⚠️ Email not configured. Please configure your email settings first in 
                  <a href="/dashboard/mail-settings" className="text-blue-600 hover:underline ml-1">
                    Mail Settings
                  </a>.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Template Toggle */}
              <div className="bg-white dark:bg-gray-800 dark:border-gray-700 p-6 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="useCustomTemplate"
                    checked={useCustomTemplate}
                    onChange={(e) => setUseCustomTemplate(e.target.checked)}
                    disabled={isProcessing}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <label htmlFor="useCustomTemplate" className="text-lg font-medium dark:text-white">
                    Use Custom Email Template
                  </label>
                  {isProcessing && (
                    <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Enable this to customize the subject and content of your reminder emails.
                  {isProcessing ? ' Changes are being saved automatically...' : ' Changes are saved automatically when you toggle this setting.'}
                </p>
              </div>

              {/* Custom Template Form */}
              {useCustomTemplate && (
                <div className="bg-white dark:bg-gray-800 dark:border-gray-700 p-6 rounded-lg border space-y-6">
                  <h3 className="text-lg font-medium dark:text-white">Custom Template</h3>
                  
                  {/* Available Variables */}
                  <div className="bg-blue-50 border border-blue-100 dark:border-0 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                      Available Variables:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-400">
                      <div><code>{'{{invoiceId}}'}</code> - Invoice ID</div>
                      <div><code>{'{{clientName}}'}</code> - Client Name</div>
                      <div><code>{'{{amount}}'}</code> - Invoice Amount</div>
                      <div><code>{'{{dueDate}}'}</code> - Due Date</div>
                      <div><code>{'{{daysOverdue}}'}</code> - Days Overdue</div>
                      <div><code>{'{{userName}}'}</code> - Your Name</div>
                    </div>
                  </div>

                  {/* Custom Subject */}
                  <div>
                    <label htmlFor="customSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Subject:
                    </label>
                    <input
                      type="text"
                      id="customSubject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="e.g., Urgent: Payment Due for Invoice {{invoiceId}}"
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      required={useCustomTemplate}
                    />
                  </div>

                  {/* Custom Content */}
                  <div>
                    <label htmlFor="customContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Content:
                    </label>
                    <textarea
                      id="customContent"
                      value={customContent}
                      onChange={(e) => setCustomContent(e.target.value)}
                      placeholder="Write your custom email content here. Use variables like {{clientName}}, {{amount}}, etc."
                      rows={12}
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      required={useCustomTemplate}
                    />
                  </div>

                  { /* Preview */ }
                  {customSubject && customContent && (
                  <div className="bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 dark:text-white">Preview (with sample data):</h4>
                    <div className="space-y-2">
                    <div>
                      <strong className="text-sm dark:text-gray-300">Subject:</strong>
                      <div
                      className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 p-2 rounded border text-sm"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHTML(
                        customSubject
                          .replace(/\{\{invoiceId\}\}/g, 'INV-12345')
                          .replace(/\{\{clientName\}\}/g, 'John Doe')
                          .replace(/\{\{amount\}\}/g, '5000')
                          .replace(/\{\{dueDate\}\}/g, '15/01/2025')
                          .replace(/\{\{daysOverdue\}\}/g, '5')
                          .replace(/\{\{userName\}\}/g, 'Your Name')
                        ),
                      }}
                      />
                    </div>
                    <div>
                      <strong className="text-sm dark:text-gray-300">Content:</strong>
                      <div
                      className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 p-2 rounded border text-sm whitespace-pre-wrap email-preview-content"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHTML(
                        customContent
                          .replace(/\{\{invoiceId\}\}/g, 'INV-12345')
                          .replace(/\{\{clientName\}\}/g, 'John Doe')
                          .replace(/\{\{amount\}\}/g, '5000')
                          .replace(/\{\{dueDate\}\}/g, '15/01/2025')
                          .replace(/\{\{daysOverdue\}\}/g, '5')
                          .replace(/\{\{userName\}\}/g, 'Your Name')
                        ),
                      }}
                      />
                    </div>
                    </div>
                  </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={isProcessing || !isEmailConfigured}
                      className={`px-6 py-3 rounded-lg font-medium ${
                        isProcessing || !isEmailConfigured
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isProcessing ? 'Saving...' : 'Save Template'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-3 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Default Template Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-6 rounded-lg border">
                <h3 className="text-lg font-medium mb-4 dark:text-white">
                  {useCustomTemplate ? 'Default Template (for reference)' : 'Current Template'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject:
                    </label>
                    <div className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3 rounded border text-sm font-mono">
                      {templateData?.defaultSubject}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content:
                    </label>
                    <div className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 p-3 rounded border text-sm font-mono whitespace-pre-wrap">
                      {templateData?.defaultContent}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmailTemplateSettings;