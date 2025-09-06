import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Book,
  CreditCard,
  MapPin,
  Bike,
  Shield,
  Users,
  Send,
  Paperclip,
  Star
} from 'lucide-react';

const SupportPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  });

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'booking', name: 'Booking & Reservations', icon: Book },
    { id: 'payment', name: 'Payment & Billing', icon: CreditCard },
    { id: 'locations', name: 'Locations & Pickup', icon: MapPin },
    { id: 'bikes', name: 'Bikes & Equipment', icon: Bike },
    { id: 'safety', name: 'Safety & Insurance', icon: Shield },
    { id: 'account', name: 'Account & Profile', icon: Users }
  ];

  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: 'How do I book a bike rental?',
      answer: 'You can book a bike rental through our website or mobile app. Simply select your pickup location, choose your dates, select a bike, and complete the payment process. You\'ll receive a confirmation email with pickup instructions.'
    },
    {
      id: 2,
      category: 'booking',
      question: 'Can I modify or cancel my booking?',
      answer: 'Yes, you can modify or cancel your booking up to 24 hours before your pickup time without any charges. For cancellations within 24 hours, a small fee may apply depending on your package.'
    },
    {
      id: 3,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and local payment methods. All transactions are secured with SSL encryption.'
    },
    {
      id: 4,
      category: 'locations',
      question: 'Can I pick up a bike in one city and drop it off in another?',
      answer: 'Yes! This is one of our key features. You can pick up a bike in any of our partner locations and drop it off at any other location within your package coverage area.'
    },
    {
      id: 5,
      category: 'bikes',
      question: 'What if the bike breaks down during my rental?',
      answer: 'All our bikes are regularly maintained, but if you experience any issues, contact our 24/7 support immediately. We\'ll arrange for a replacement bike or roadside assistance depending on the situation.'
    },
    {
      id: 6,
      category: 'safety',
      question: 'Is insurance included with my rental?',
      answer: 'Yes, all rentals include basic insurance coverage. Premium packages include comprehensive insurance with additional coverage for theft, damage, and personal injury.'
    },
    {
      id: 7,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'You can update your profile information by logging into your account and visiting the Profile section. Make sure to keep your contact information current for booking confirmations.'
    },
    {
      id: 8,
      category: 'booking',
      question: 'What happens if I\'m late for pickup?',
      answer: 'We hold your bike for up to 2 hours past your scheduled pickup time. If you\'re running late, please contact the partner shop directly. Late pickups may result in shortened rental periods.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle ticket submission
    console.log('Ticket submitted:', ticketForm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#FF7F50] to-[#FF69B4] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How Can We Help?</h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
              Find answers to common questions or get in touch with our support team
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-200"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Contact */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Contact</h3>
              <div className="space-y-4">
                <a
                  href="tel:+94112345678"
                  className="flex items-center p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Phone className="h-5 w-5 text-emerald-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Call Us</div>
                    <div className="text-sm text-gray-600">+94 71 234 5678</div>
                  </div>
                </a>
                
                <a
                  href="mailto:support@cycle.lk"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Email Us</div>
                    <div className="text-sm text-gray-600">support@cycle.lk</div>
                  </div>
                </a>
                
                <button className="w-full flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <MessageCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Live Chat</div>
                    <div className="text-sm text-gray-600">Available 24/7</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Hours</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Phone Support</div>
                    <div className="text-sm text-gray-600">6:00 AM - 10:00 PM</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Live Chat</div>
                    <div className="text-sm text-gray-600">24/7 Available</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Email Response</div>
                    <div className="text-sm text-gray-600">Within 2 hours</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center p-4 rounded-lg border-2 transition-colors ${
                      selectedCategory === category.id
                        ? 'border-[#00D4AA] bg-emerald-50 text-[#00D4AA]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <category.icon className="h-5 w-5 mr-3" />
                    <span className="font-medium text-sm">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Frequently Asked Questions ({filteredFaqs.length})
              </h3>
              
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFaq === faq.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No articles found</h4>
                  <p className="text-gray-600">Try adjusting your search or browse different categories</p>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Still Need Help? Contact Us</h3>
              
              <form onSubmit={handleSubmitTicket} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="booking">Booking & Reservations</option>
                      <option value="payment">Payment & Billing</option>
                      <option value="locations">Locations & Pickup</option>
                      <option value="bikes">Bikes & Equipment</option>
                      <option value="safety">Safety & Insurance</option>
                      <option value="account">Account & Profile</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <div className="flex space-x-4">
                    {[
                      { value: 'low', label: 'Low', color: 'bg-emerald-100 text-green-800 border-2 border-[#00D4AA]' },
                      { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-2 border-[#FFD700]' },
                      { value: 'high', label: 'High', color: 'bg-red-100 text-red-800 border-2 border-[#FF4757]' }
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setTicketForm(prev => ({ ...prev, priority: priority.value }))}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          ticketForm.priority === priority.value
                            ? priority.color
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none"
                    placeholder="Please provide as much detail as possible about your issue..."
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="flex items-center text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach Files
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Additional Resources</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Guide</h3>
              <p className="text-gray-600 mb-4">Complete guide to using Cycle.LK platform</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Download PDF
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Forum</h3>
              <p className="text-gray-600 mb-4">Connect with other cyclists and get tips</p>
              <button className="text-green-600 hover:text-green-700 font-medium">
                Visit Forum
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
              <p className="text-gray-600 mb-4">Help us improve by sharing your experience</p>
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                Give Feedback
              </button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default SupportPage;