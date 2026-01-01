import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LandingFooterProps {
    onGetStarted?: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onGetStarted }) => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (onGetStarted) {
            onGetStarted();
        } else {
            navigate('/signup');
        }
    };

    return (
        <>
            {/* CTA Section */}
            <section className="relative py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to experience smarter &<br />more accurate AI answers?
                    </h2>
                    <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto">
                        Gain an edge with our exclusive platform, designed to provide you with tailored insights and guidance across every industry and subject.
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 hover:scale-105"
                    >
                        Get Started Now
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-12 px-4 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <img src="/kroniq-logo-white.png" alt="KroniQ" className="w-8 h-8" />
                            <span className="text-white font-bold">KroniQ</span>
                        </div>
                        <p className="text-white/40 text-sm">
                            ✉ support@kroniqai.com
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-white/5">
                        <div className="flex gap-6 text-sm text-white/40">
                            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a>
                        </div>
                        <p className="text-white/30 text-sm">© 2025 KroniQ. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default LandingFooter;
