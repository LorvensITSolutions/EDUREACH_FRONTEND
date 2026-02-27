import React from 'react';
import Layout from "../Layout";
import { Trash2, Mail, ShieldAlert, Clock, Database, AlertTriangle } from 'lucide-react';

const AccountDeletion = () => {
    return (
        <Layout
            title="Account Deletion Request"
            subtitle="How to request deletion of your account and associated data"
            showSidebar={false}
        >
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                {/* Introduction */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-primary mb-4">1. Introduction</h2>
                    <p className="text-gray-700 leading-relaxed text-lg mb-4">
                        At EduReach, we respect your right to control your personal data. This page explains how you can request deletion of your EduReach account and associated data.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                        If you wish to permanently delete your account and remove your personal information from our systems, please follow the process outlined below.
                    </p>
                    <p className="text-gray-500 text-sm">Last Updated: December 20, 2024</p>
                </div>

                {/* Grid for Process & Contact */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* How to Request */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-accent/20 rounded-lg mr-4">
                                <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-primary">2. How to Request Deletion</h3>
                        </div>
                        <p className="text-gray-700 mb-4">Users can request deletion of their EduReach account and associated data by:</p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                            <li>Sending an email to: <strong>yeslorvenssolutions@gmail.com</strong></li>
                            <li>Mentioning their registered email address associated with the EduReach account</li>
                            <li>Requesting account deletion in the email subject or body</li>
                        </ul>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">2.1 Email Requirements:</h4>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                                <li>Your registered email address used for the EduReach account</li>
                                <li>Your full name (as registered in the account)</li>
                                <li>Clear statement requesting account deletion</li>
                                <li>Any additional verification information if requested by our support team</li>
                            </ul>
                        </div>
                    </div>

                    {/* Deletion Process */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-accent/20 rounded-lg mr-4">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-primary">3. Account Deletion Process</h3>
                        </div>
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">3.1 Verification</h4>
                            <p className="text-gray-700 text-sm mb-2">Upon receiving your deletion request, our support team will:</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                                <li>Verify your identity and account ownership</li>
                                <li>Confirm the email address matches the registered account</li>
                                <li>Process your deletion request securely</li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">3.2 Deletion Timeline</h4>
                            <p className="text-gray-700 text-sm mb-2">After verification:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                                <li>User account will be permanently deleted within 7 working days from the date of verification</li>
                                <li>You will receive a confirmation email once the deletion process is complete</li>
                                <li>After deletion, you will no longer be able to access your account or recover any data</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Data Deletion Details */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center mb-6">
                        <div className="p-3 bg-accent/20 rounded-lg mr-4">
                            <Database className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-primary">4. Data Deletion Details</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="border-l-4 border-accent pl-6">
                            <h3 className="text-xl font-bold text-primary mb-3">4.1 Data That Will Be Deleted</h3>
                            <p className="text-gray-700 leading-relaxed mb-2">The following personal data will be permanently removed from our systems:</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                                <li><strong>Personal Information:</strong> Name, email address, phone number</li>
                                <li><strong>Account Data:</strong> Profile information, preferences, settings</li>
                                <li><strong>Academic Data:</strong> Student records, attendance, and associated data</li>
                                <li><strong>Activity Data:</strong> App usage history, event participation records</li>
                            </ul>
                        </div>
                        <div className="border-l-4 border-accent pl-6">
                            <h3 className="text-xl font-bold text-primary mb-3">4.2 Data Retention for Compliance</h3>
                            <p className="text-gray-700 leading-relaxed mb-2">Certain transactional or legal records may be retained for compliance purposes for up to 90 days. This may include:</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                                <li>Financial transaction records (for tax and legal compliance)</li>
                                <li>Legal documentation required by law</li>
                                <li>Records necessary for dispute resolution</li>
                                <li>Data required for regulatory compliance</li>
                            </ul>
                            <p className="text-gray-600 mt-2 text-sm italic">After the retention period, all retained data will be permanently deleted.</p>
                        </div>
                    </div>
                </div>

                {/* Important Considerations */}
                <div className="bg-red-50 rounded-2xl shadow-lg p-8 border border-red-100">
                    <div className="flex items-center mb-6">
                        <div className="p-3 bg-red-100 rounded-lg mr-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-800">5. Important Considerations</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-bold text-red-700 mb-2">5.1 Before Requesting Deletion</h3>
                            <p className="text-red-900 text-sm mb-2">Please consider the following before requesting account deletion:</p>
                            <ul className="list-disc list-inside text-red-900 space-y-2 text-sm">
                                <li><strong>Irreversible Action:</strong> Account deletion is permanent and cannot be undone</li>
                                <li><strong>Data Loss:</strong> All your data, including academic records, attendance history, and achievements will be permanently lost</li>
                                <li><strong>Pending Requests:</strong> Ensure all pending requests (e.g., admissions, library) are completed before deletion</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-700 mb-2">5.2 Alternative Options</h3>
                            <p className="text-red-900 text-sm mb-2">If you don't want to permanently delete your account, consider:</p>
                            <ul className="list-disc list-inside text-red-900 space-y-2 text-sm">
                                <li>Deactivating your account temporarily (contact support for options)</li>
                                <li>Updating your privacy settings</li>
                                <li>Unsubscribing from notifications</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Contact Support */}
                <div className="bg-accent text-primary rounded-2xl p-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">6. Contact Support</h2>
                    <p className="text-lg mb-4 leading-relaxed max-w-2xl mx-auto">
                        For questions about account deletion, the deletion process, or any concerns, please contact our support team:
                    </p>
                    <a href="mailto:yeslorvenssolutions@gmail.com" className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold mb-4">
                        Email: yeslorvenssolutions@gmail.com
                    </a>
                    <p className="text-sm">
                        Our support team will respond to your account deletion request and any questions within 24-48 hours during business days.
                    </p>
                </div>

                {/* Acknowledgment */}
                <div className="text-center text-gray-500 text-sm max-w-3xl mx-auto mt-8">
                    <h3 className="font-bold mb-2">7. Changes to This Policy</h3>
                    <p className="mb-4">
                        EduReach may update this Account Deletion Policy from time to time. We will notify you of any changes by posting the updated policy in the app, updating the "Last Updated" date, and sending you a notification for significant changes.
                    </p>
                    <h3 className="font-bold mb-2 mt-4">8. Acknowledgment</h3>
                    <p className="mb-4">
                        By requesting account deletion, you acknowledge that you understand the permanent nature of this action and that all your data will be removed in accordance with this policy and applicable data protection laws.
                    </p>
                    <p>© 2024 YesLorvens. All rights reserved.</p>
                </div>
            </div>
        </Layout>
    );
};

export default AccountDeletion;
