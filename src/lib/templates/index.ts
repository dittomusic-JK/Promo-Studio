import type { AssetTemplate, Platform } from '@/types'

import igSquare from './ig-square'
import igPortrait from './ig-portrait'
import igStory from './ig-story'
import igCarousel from './ig-carousel'
import twitterPost from './twitter-post'
import twitterBanner from './twitter-banner'
import fbPost from './fb-post'
import fbCover from './fb-cover'
import ytThumb from './yt-thumb'
import pressHeader from './press-header'
import emailBanner from './email-banner'

export {
  igSquare,
  igPortrait,
  igStory,
  igCarousel,
  twitterPost,
  twitterBanner,
  fbPost,
  fbCover,
  ytThumb,
  pressHeader,
  emailBanner,
}

export const allTemplates: AssetTemplate[] = [
  igSquare,
  igPortrait,
  igStory,
  igCarousel,
  twitterPost,
  twitterBanner,
  fbPost,
  fbCover,
  ytThumb,
  pressHeader,
  emailBanner,
]

export const templatesByPlatform: Record<Platform, AssetTemplate[]> = {
  instagram: [igSquare, igPortrait, igStory, igCarousel],
  twitter: [twitterPost, twitterBanner],
  facebook: [fbPost, fbCover],
  youtube: [ytThumb],
  general: [pressHeader, emailBanner],
}

export const platformLabels: Record<Platform, string> = {
  instagram: 'Instagram',
  twitter: 'X / Twitter',
  facebook: 'Facebook',
  youtube: 'YouTube',
  general: 'General',
}
