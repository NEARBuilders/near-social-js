import { useState } from 'react';
import { Loader2, User } from 'lucide-react';
import type { Profile } from 'near-social-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ProfileEditDialogProps {
  profile: Profile | null;
  onSave: (profile: Partial<Profile>) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileEditDialog({
  profile,
  onSave,
  isLoading,
}: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    description: profile?.description || '',
    backgroundImage: profile?.backgroundImage?.url || '',
    twitter: (profile?.linktree?.twitter as string) || '',
    github: (profile?.linktree?.github as string) || '',
    website: (profile?.linktree?.website as string) || '',
    tags: Object.keys(profile?.tags || {}).join(', '),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagsObject: Record<string, string> = {};
    if (formData.tags) {
      formData.tags.split(',').forEach((tag) => {
        const trimmed = tag.trim();
        if (trimmed) {
          tagsObject[trimmed] = '';
        }
      });
    }

    const linktree: Record<string, string> = {};
    if (formData.twitter) linktree.twitter = formData.twitter;
    if (formData.github) linktree.github = formData.github;
    if (formData.website) linktree.website = formData.website;

    const profileUpdate: Partial<Profile> = {
      name: formData.name || undefined,
      description: formData.description || undefined,
      tags: Object.keys(tagsObject).length > 0 ? tagsObject : undefined,
      linktree: Object.keys(linktree).length > 0 ? linktree : undefined,
    };

    if (formData.backgroundImage) {
      profileUpdate.backgroundImage = { url: formData.backgroundImage };
    }

    await onSave(profileUpdate);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer border-white/20 text-white/70 hover:bg-white/10 hover:text-white">
          <User className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Profile</DialogTitle>
          <DialogDescription className="text-white/60">
            Update your profile information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name" className="text-white/80">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Your display name"
              className="bg-black/30 border-white/10 text-white placeholder:text-white/30 focus:border-[#00EC97]/50"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white/80">
              Description
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Tell us about yourself"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00EC97]/50"
            />
          </div>

          <div>
            <Label htmlFor="backgroundImage" className="text-white/80">
              Background Image URL
            </Label>
            <Input
              id="backgroundImage"
              type="text"
              value={formData.backgroundImage}
              onChange={(e) =>
                setFormData({ ...formData, backgroundImage: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className="bg-black/30 border-white/10 text-white placeholder:text-white/30 focus:border-[#00EC97]/50"
            />
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-white/80">
              Social Links
            </h3>

            <div>
              <Label htmlFor="twitter" className="text-white/70 text-sm">
                Twitter
              </Label>
              <Input
                id="twitter"
                type="text"
                value={formData.twitter}
                onChange={(e) =>
                  setFormData({ ...formData, twitter: e.target.value })
                }
                placeholder="username"
                className="bg-black/30 border-white/10 text-white placeholder:text-white/30 focus:border-[#00EC97]/50"
              />
            </div>

            <div>
              <Label htmlFor="github" className="text-white/70 text-sm">
                GitHub
              </Label>
              <Input
                id="github"
                type="text"
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
                placeholder="username"
                className="bg-black/30 border-white/10 text-white placeholder:text-white/30 focus:border-[#00EC97]/50"
              />
            </div>

            <div>
              <Label htmlFor="website" className="text-white/70 text-sm">
                Website
              </Label>
              <Input
                id="website"
                type="text"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://example.com"
                className="bg-black/30 border-white/10 text-white placeholder:text-white/30 focus:border-[#00EC97]/50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags" className="text-white/80">
              Tags
            </Label>
            <Input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="developer, designer, creator (comma-separated)"
              className="bg-black/30 border-white/10 text-white placeholder:text-white/30 focus:border-[#00EC97]/50"
            />
            <p className="text-xs text-white/40 mt-1">
              Separate tags with commas
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="cursor-pointer border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer bg-[#00EC97] text-black font-semibold hover:bg-[#00d084]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
