import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Smile,
  Globe,
  Send,
  MoreHorizontal,
} from 'lucide-react';
import { MomentPost, UserProfile, Language } from '../types';
import { translations } from '../utils/translations';
import { EMOJI_REACTIONS } from '../data/mockData';

interface MomentsViewProps {
  moments: MomentPost[];
  currentUser: UserProfile;
  onAddPost: (content: string, images: string[]) => void;
  onLikePost: (postId: string, reaction: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onSelectImage: (url: string) => void;
  lang: Language;
}

export const MomentsView: React.FC<MomentsViewProps> = ({
  moments,
  currentUser,
  onAddPost,
  onLikePost,
  onAddComment,
  onSelectImage,
  lang,
}) => {
  const t = translations[lang];
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewPostImages([...newPostImages, event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && newPostImages.length === 0) return;

    onAddPost(newPostContent.trim(), newPostImages);
    setNewPostContent('');
    setNewPostImages([]);
  };

  const handleSendComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-100/70 p-6 flex flex-col items-center select-none">
      <div className="w-full max-w-2xl space-y-5">
        {/* Post Creation Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
          <form onSubmit={handleCreatePost}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <textarea
                  rows={2}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={t.postStatusPlaceholder}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
                />

                {/* Uploaded image previews */}
                {newPostImages.length > 0 && (
                  <div className="flex gap-2 my-2 overflow-x-auto pb-1">
                    {newPostImages.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <img src={img} alt="Upload" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewPostImages(newPostImages.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-500">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-600 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span>Đăng ảnh</span>
                </button>
                <div className="flex items-center gap-1 text-xs text-slate-400 ml-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Công khai</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!newPostContent.trim() && newPostImages.length === 0}
                className="px-5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {t.post}
              </button>
            </div>
          </form>
        </div>

        {/* Moments Feed */}
        {moments.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{post.author.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>{post.timestamp}</span>
                    <span>·</span>
                    <Globe className="w-3 h-3" />
                  </div>
                </div>
              </div>

              <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Post Photos */}
            {post.images.length > 0 && (
              <div
                onClick={() => onSelectImage(post.images[0])}
                className="w-full max-h-96 overflow-hidden bg-slate-100 cursor-pointer border-y border-slate-100"
              >
                <img
                  src={post.images[0]}
                  alt="Post visual"
                  className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
            )}

            {/* Like count summary */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-[10px]">
                  ❤️
                </span>
                <span>{post.likes.count} lượt thích</span>
              </div>
              <div>{post.comments.length} bình luận</div>
            </div>

            {/* Interaction Buttons Bar */}
            <div className="px-4 py-1.5 flex items-center justify-around border-b border-slate-100 text-xs font-medium text-slate-600 relative">
              <div className="relative">
                <button
                  onClick={() => onLikePost(post.id, '❤️')}
                  onMouseEnter={() => setActiveReactionPostId(post.id)}
                  className={`flex items-center gap-1.5 py-1.5 px-4 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ${
                    post.likes.hasLiked ? 'text-rose-600 font-semibold' : ''
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${post.likes.hasLiked ? 'fill-rose-600' : ''}`}
                  />
                  <span>{post.likes.hasLiked ? post.likes.reaction || t.like : t.like}</span>
                </button>

                {/* Hover Reaction selector */}
                {activeReactionPostId === post.id && (
                  <div
                    onMouseLeave={() => setActiveReactionPostId(null)}
                    className="absolute -top-10 left-0 bg-white border border-slate-200 rounded-full shadow-lg p-1 flex items-center gap-1 z-20 animate-in fade-in"
                  >
                    {EMOJI_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onLikePost(post.id, emoji);
                          setActiveReactionPostId(null);
                        }}
                        className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-base hover:scale-125 transition-transform cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <span>{t.comment}</span>
              </button>

              <button className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <Share2 className="w-4 h-4" />
                <span>Chia sẻ</span>
              </button>
            </div>

            {/* Comments Thread */}
            <div className="p-4 bg-slate-50/50 space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0">
                    <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border border-slate-200/80 rounded-2xl px-3 py-2 text-xs">
                      <span className="font-semibold text-slate-900 mr-1.5">{comment.author}</span>
                      <span className="text-slate-800">{comment.text}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 ml-2">{comment.time}</div>
                  </div>
                </div>
              ))}

              {/* Add comment input */}
              <div className="flex items-center gap-2 pt-2">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-full px-3 py-1">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendComment(post.id);
                      }
                    }}
                    placeholder={t.writeComment}
                    className="flex-1 text-xs bg-transparent border-none focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendComment(post.id)}
                    className="p-1 text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
