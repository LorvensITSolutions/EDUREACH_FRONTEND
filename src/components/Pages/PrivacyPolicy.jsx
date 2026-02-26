import React from 'react';
import Layout from "../Layout";
import { Shield, Lock, Eye, FileCheck, Bell, Info } from 'lucide-react';

const PrivacyPolicy = () => {
    const sections = [
        {
            icon: Eye,
            title: 'Information We Collect',
            content: 'We collect information that you provide directly to us, such as when you create an account, fill out an admission form, or communicate with us. This may include your name, email address, phone number, and student-related data.'
        },
        {
            icon: Lock,
            title: 'How We Use Your Information',
            content: 'The information we collect is used to provide, maintain, and improve our educational services, process admissions, communicate with parents and students, and ensure the security of our platform.'
        },
        {
            icon: Shield,
            title: 'Data Security',
            content: 'We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. This includes encryption and regular security audits.'
        },
        {
            icon: FileCheck,
            title: 'Information Sharing',
            content: 'We do not share your personal information with third parties except as necessary to provide our services, comply with the law, or protect our rights. This may include sharing with educational partners under strict confidentiality.'
        },
        {
            icon: Bell,
            title: 'Policy Updates',
            content: 'We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.'
        },
        {
            icon: Info,
            title: 'Your Choices',
            content: 'You have the right to access, update, or delete your personal information. If you have any questions or concerns about your privacy, please contact our administration.'
        }
    ];

    return (
        <Layout
            title="Privacy Policy"
            subtitle="How we handle and protect your personal information at EduReach"
            showSidebar={false}
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Introduction */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-3xl font-bold text-primary mb-6">Our Commitment to Privacy</h2>
                    <p className="text-gray-700 leading-relaxed text-lg mb-6">
                        At EduReach, we take your privacy seriously. This Privacy Policy explains how we collect,
                        use, and protect your personal information when you use our website and services.
                        We are committed to ensuring that your data is handled with transparency and care.
                    </p>
                    <p className="text-gray-500 text-sm">Last Updated: February 26, 2026</p>
                </div>

                {/* Policy Sections */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sections.map((section, index) => {
                        const IconComponent = section.icon;
                        return (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 bg-accent/20 rounded-lg mr-4">
                                        <IconComponent className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary">{section.title}</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-sm">{section.content}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Detailed Information */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-3xl font-bold text-primary mb-8">Detailed Privacy Standards</h2>
                    <div className="space-y-6">
                        <div className="border-l-4 border-accent pl-6">
                            <h3 className="text-xl font-bold text-primary mb-3">Student Data Protection</h3>
                            <p className="text-gray-700 leading-relaxed">
                                Student information is handled with the highest level of confidentiality. Access to student records
                                is strictly limited to authorized staff members who require it for educational or administrative purposes.
                            </p>
                        </div>
                        <div className="border-l-4 border-accent pl-6">
                            <h3 className="text-xl font-bold text-primary mb-3">Cookies and Tracking</h3>
                            <p className="text-gray-700 leading-relaxed">
                                We use cookies to improve your experience on our website. Cookies help us understand how
                                you interact with our site, allowing us to personalize content and analyze traffic patterns.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-accent text-primary rounded-2xl p-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Contact Our Privacy Officer</h2>
                    <p className="text-lg mb-6 leading-relaxed">
                        If you have any questions about our privacy practices, please reach out to us.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="mailto:privacy@edureach.edu" className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300 font-semibold text-center">
                            Email Us
                        </a>
                        <button className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 font-semibold">
                            Download Full Policy (PDF)
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PrivacyPolicy;
