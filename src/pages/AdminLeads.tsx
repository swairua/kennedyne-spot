import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createWhatsAppLink, WHATSAPP_MESSAGES, DEFAULT_WHATSAPP_PHONE } from '@/utils/whatsapp';
import { Mail, Phone, Calendar, User, MessageSquare, Target } from 'lucide-react';
import { format } from 'date-fns';

interface MentorshipApplication {
  id: string;
  name: string;
  email: string;
  phone?: string;
  experience: string;
  goals: string;
  availability: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  created_at: string;
  admin_notes?: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
  admin_notes?: string;
}

interface NewsletterSubscription {
  id: string;
  email: string;
  source_url?: string;
  status: 'new' | 'active' | 'unsubscribed';
  created_at: string;
  admin_notes?: string;
}

interface SessionRegistration {
  id: string;
  email: string;
  source_url?: string;
  status: 'new' | 'confirmed' | 'attended' | 'no_show';
  created_at: string;
  admin_notes?: string;
}

export default function AdminLeads() {
  const [mentorshipApplications, setMentorshipApplications] = useState<MentorshipApplication[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [newsletterSubscriptions, setNewsletterSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [sessionRegistrations, setSessionRegistrations] = useState<SessionRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mentorshipRes, contactRes, newsletterRes, sessionRes] = await Promise.all([
        supabase
          .from('mentorship_applications')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('newsletter_subscriptions')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('session_registrations')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (mentorshipRes.error) throw mentorshipRes.error;
      if (contactRes.error) throw contactRes.error;
      if (newsletterRes.error) throw newsletterRes.error;
      if (sessionRes.error) throw sessionRes.error;

      setMentorshipApplications(mentorshipRes.data as MentorshipApplication[] || []);
      setContactSubmissions(contactRes.data as ContactSubmission[] || []);
      setNewsletterSubscriptions(newsletterRes.data as NewsletterSubscription[] || []);
      setSessionRegistrations(sessionRes.data as SessionRegistration[] || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load leads data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMentorshipStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('mentorship_applications')
        .update({ status, admin_notes: notes })
        .eq('id', id);

      if (error) throw error;

      setMentorshipApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status: status as any, admin_notes: notes } : app
        )
      );

      toast({
        title: "Updated",
        description: "Application status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const updateContactStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status, admin_notes: notes })
        .eq('id', id);

      if (error) throw error;

      setContactSubmissions(prev => 
        prev.map(submission => 
          submission.id === id ? { ...submission, status: status as any, admin_notes: notes } : submission
        )
      );

      toast({
        title: "Updated",
        description: "Contact status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'contacted':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading leads...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Leads Management</h1>
      
      <Tabs defaultValue="mentorship" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mentorship">
            Mentorship Applications ({mentorshipApplications.length})
          </TabsTrigger>
          <TabsTrigger value="contact">
            Contact Submissions ({contactSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentorship" className="space-y-4">
          {mentorshipApplications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {application.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(application.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${application.email}`} className="text-blue-600 hover:underline">
                      {application.email}
                    </a>
                  </div>
                  {application.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{application.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{application.availability}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Trading Experience:</h4>
                  <p className="text-gray-700 text-sm">{application.experience}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Goals:</h4>
                  <p className="text-gray-700 text-sm">{application.goals}</p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Select 
                    value={application.status} 
                    onValueChange={(value) => updateMentorshipStatus(application.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const whatsappUrl = createWhatsAppLink(
                        application.phone, 
                        WHATSAPP_MESSAGES.adminReply(application.name, 'mentorship')
                      );
                      window.open(whatsappUrl, '_blank');
                    }}
                    disabled={!application.phone}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp {!application.phone && "(No phone)"}
                  </Button>
                </div>

                {application.admin_notes && (
                  <div className="pt-2 border-t">
                    <h4 className="font-semibold mb-1">Admin Notes:</h4>
                    <p className="text-gray-700 text-sm">{application.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          {contactSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {submission.name} - {submission.subject}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(submission.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${submission.email}`} className="text-blue-600 hover:underline">
                      {submission.email}
                    </a>
                  </div>
                  {submission.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{submission.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Message:</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{submission.message}</p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Select 
                    value={submission.status} 
                    onValueChange={(value) => updateContactStatus(submission.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const emailSubject = `Re: ${submission.subject}`;
                      const emailBody = `Hi ${submission.name},\n\nThank you for contacting us regarding "${submission.subject}". \n\n[Your response here]\n\nBest regards,\nKenneDyne spot Team`;
                      window.location.href = `mailto:${submission.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const whatsappUrl = createWhatsAppLink(
                        submission.phone, 
                        WHATSAPP_MESSAGES.adminReply(submission.name, 'contact')
                      );
                      window.open(whatsappUrl, '_blank');
                    }}
                    disabled={!submission.phone}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp {!submission.phone && "(No phone)"}
                  </Button>
                </div>

                {submission.admin_notes && (
                  <div className="pt-2 border-t">
                    <h4 className="font-semibold mb-1">Admin Notes:</h4>
                    <p className="text-gray-700 text-sm">{submission.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
