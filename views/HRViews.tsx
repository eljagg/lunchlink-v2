import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
import { MessageSquare, User, Clock, CheckCircle, Send } from 'lucide-react';

export const HRCommentsView: React.FC = () => {
  const { comments, respondToComment, currentUser } = useStore();
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const handleReply = (commentId: string) => {
    if (!currentUser || !replyText[commentId]) return;
    respondToComment(commentId, replyText[commentId], currentUser);
    setReplyText({ ...replyText, [commentId]: '' });
  };

  // Sort: Recent first
  const sortedComments = [...comments].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-purple-600" />
          Employee Feedback Portal
        </h2>
        <p className="text-slate-500 mt-1">Review and respond to employee suggestions.</p>
      </div>

      <div className="grid gap-6">
        {sortedComments.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No feedback received yet.</p>
          </div>
        ) : (
          sortedComments.map(comment => {
            const hasResponse = comment.responses && comment.responses.length > 0;
            return (
              <div key={comment.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-500" />
                         </div>
                         <div>
                            <h3 className="font-bold text-slate-800">{comment.userName}</h3>
                            <p className="text-xs text-slate-400 flex items-center">
                               <Clock className="w-3 h-3 mr-1" /> 
                               {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString()}
                            </p>
                         </div>
                      </div>
                      {hasResponse && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
                             <CheckCircle className="w-3 h-3" /> Responded
                          </span>
                      )}
                   </div>
                   <p className="text-slate-700 text-lg leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                      "{comment.content}"
                   </p>
                </div>
                
                {/* Responses Section */}
                <div className="p-6 bg-slate-50/50">
                    {comment.responses && comment.responses.map((resp: any, idx: number) => (
                        <div key={idx} className="flex gap-3 mb-4 pl-4 border-l-2 border-purple-300">
                            <div>
                                <p className="text-xs font-bold text-purple-700 mb-1">{resp.responder} (HR)</p>
                                <p className="text-slate-600 text-sm">{resp.text}</p>
                            </div>
                        </div>
                    ))}
                    
                    <div className="mt-4 flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Write a response..."
                            value={replyText[comment.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                        />
                        <button 
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyText[comment.id]}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
