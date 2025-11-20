import React from "react";
import {
  Autocomplete,
  TextField,
  MenuItem,
  InputAdornment,
  Box,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import MicIcon from "@mui/icons-material/Mic";
import PianoIcon from "@mui/icons-material/Piano";
import BrushIcon from "@mui/icons-material/Brush";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import ComputerIcon from "@mui/icons-material/Computer";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import AlbumIcon from "@mui/icons-material/Album";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeMuteIcon from "@mui/icons-material/VolumeMute";
import HeadsetIcon from "@mui/icons-material/Headset";
import RadioIcon from "@mui/icons-material/Radio";
import SurroundSoundIcon from "@mui/icons-material/SurroundSound";
import SpeakerIcon from "@mui/icons-material/Speaker";
import SpeakerGroupIcon from "@mui/icons-material/SpeakerGroup";
import MusicOffIcon from "@mui/icons-material/MusicOff";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import QueuePlayNextIcon from "@mui/icons-material/QueuePlayNext";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import TimelineIcon from "@mui/icons-material/Timeline";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import MapIcon from "@mui/icons-material/Map";
import PlaceIcon from "@mui/icons-material/Place";
import PublicIcon from "@mui/icons-material/Public";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventIcon from "@mui/icons-material/Event";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import WorkIcon from "@mui/icons-material/Work";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PsychologyIcon from "@mui/icons-material/Psychology";
import HandshakeIcon from "@mui/icons-material/Handshake";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import Diversity2Icon from "@mui/icons-material/Diversity2";
import Face6Icon from "@mui/icons-material/Face6";
import Face3Icon from "@mui/icons-material/Face3";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ChatIcon from "@mui/icons-material/Chat";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import CampaignIcon from "@mui/icons-material/Campaign";
import ForumIcon from "@mui/icons-material/Forum";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import MusicVideoIcon from "@mui/icons-material/MusicVideo";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import QueueMusicOutlinedIcon from "@mui/icons-material/QueueMusicOutlined";
import TheaterComedyOutlinedIcon from "@mui/icons-material/TheaterComedyOutlined";
import BrushOutlinedIcon from "@mui/icons-material/BrushOutlined";
import PaletteIcon from "@mui/icons-material/Palette";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ImageIcon from "@mui/icons-material/Image";
import MovieIcon from "@mui/icons-material/Movie";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import NoteIcon from "@mui/icons-material/Note";
import NotesIcon from "@mui/icons-material/Notes";
import ArticleIcon from "@mui/icons-material/Article";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import ScienceIcon from "@mui/icons-material/Science";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CircleIcon from "@mui/icons-material/Circle";
import AdjustIcon from "@mui/icons-material/Adjust";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import BoltIcon from "@mui/icons-material/Bolt";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ExploreIcon from "@mui/icons-material/Explore";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import EqualizerOutlinedIcon from "@mui/icons-material/EqualizerOutlined";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import COLORS from "../../assets/colors";

export type ImpactIconKey = string;

export interface ImpactIconDef {
  key: ImpactIconKey;
  label: string;
  Icon: React.ElementType;
  category: string;
}

// Curated, reusable icon library for the impact report admin UIs
export const IMPACT_ICON_LIBRARY: ImpactIconDef[] = [
  // Navigation / sections (used in impact report header)
  { key: "homeOutlined", label: "Home (Outlined)", Icon: HomeOutlinedIcon, category: "Navigation" },
  { key: "flagOutlined", label: "Flag / Mission", Icon: FlagOutlinedIcon, category: "Navigation" },
  { key: "groupsOutlined", label: "Groups / Who We Serve", Icon: GroupsOutlinedIcon, category: "Navigation" },
  { key: "savingsOutlined", label: "Savings / Financials", Icon: SavingsOutlinedIcon, category: "Navigation" },
  { key: "tuneOutlined", label: "Tune / Method", Icon: TuneOutlinedIcon, category: "Navigation" },
  { key: "menuBookOutlined", label: "Curriculum (Outlined)", Icon: MenuBookOutlinedIcon, category: "Navigation" },
  { key: "equalizerOutlined", label: "Impact Equalizer (Outlined)", Icon: EqualizerOutlinedIcon, category: "Navigation" },
  { key: "formatQuoteOutlined", label: "Quote (Outlined)", Icon: FormatQuoteOutlinedIcon, category: "Navigation" },
  { key: "placeOutlined", label: "Location Pin (Outlined)", Icon: PlaceOutlinedIcon, category: "Navigation" },
  { key: "insightsOutlined", label: "Insights / Levels", Icon: InsightsOutlinedIcon, category: "Navigation" },
  { key: "handshakeOutlined", label: "Handshake (Outlined)", Icon: HandshakeOutlinedIcon, category: "Support" },
  { key: "mailOutline", label: "Mail / Contact (Outlined)", Icon: MailOutlineOutlinedIcon, category: "Communication" },
  // Social
  { key: "facebook", label: "Facebook", Icon: FacebookIcon, category: "Social" },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon, category: "Social" },
  { key: "twitter", label: "Twitter", Icon: TwitterIcon, category: "Social" },
  { key: "youtube", label: "YouTube", Icon: YouTubeIcon, category: "Social" },
  // Music & audio
  { key: "musicNote", label: "Music Note", Icon: MusicNoteIcon, category: "Music" },
  { key: "graphicEq", label: "Graphic EQ", Icon: GraphicEqIcon, category: "Music" },
  { key: "mic", label: "Microphone", Icon: MicIcon, category: "Music" },
  { key: "piano", label: "Piano", Icon: PianoIcon, category: "Music" },
  { key: "audiotrack", label: "Audio Track", Icon: AudiotrackIcon, category: "Music" },
  { key: "queueMusic", label: "Queue Music", Icon: QueueMusicIcon, category: "Music" },
  { key: "queueMusicAlt", label: "Queue Music (Outlined)", Icon: QueueMusicOutlinedIcon, category: "Music" },
  { key: "headphones", label: "Headphones", Icon: HeadphonesIcon, category: "Music" },
  { key: "musicVideo", label: "Music Video", Icon: MusicVideoIcon, category: "Music" },
  { key: "libraryMusic", label: "Library Music", Icon: LibraryMusicIcon, category: "Music" },
  { key: "equalizer", label: "Equalizer", Icon: EqualizerIcon, category: "Music" },
  { key: "album", label: "Album", Icon: AlbumIcon, category: "Music" },
  { key: "volumeUp", label: "Volume Up", Icon: VolumeUpIcon, category: "Music" },
  { key: "volumeDown", label: "Volume Down", Icon: VolumeDownIcon, category: "Music" },
  { key: "volumeOff", label: "Volume Off", Icon: VolumeOffIcon, category: "Music" },
  { key: "volumeMute", label: "Volume Mute", Icon: VolumeMuteIcon, category: "Music" },
  { key: "headset", label: "Headset", Icon: HeadsetIcon, category: "Music" },
  { key: "radio", label: "Radio", Icon: RadioIcon, category: "Music" },
  { key: "surroundSound", label: "Surround Sound", Icon: SurroundSoundIcon, category: "Music" },
  { key: "speaker", label: "Speaker", Icon: SpeakerIcon, category: "Music" },
  { key: "speakerGroup", label: "Speaker Group", Icon: SpeakerGroupIcon, category: "Music" },
  { key: "musicOff", label: "Music Off", Icon: MusicOffIcon, category: "Music" },
  { key: "playlistPlay", label: "Playlist Play", Icon: PlaylistPlayIcon, category: "Music" },
  { key: "queuePlayNext", label: "Queue Play Next", Icon: QueuePlayNextIcon, category: "Music" },
  { key: "videoLibrary", label: "Video Library", Icon: VideoLibraryIcon, category: "Music" },
  // Music disciplines (semantic aliases for instruments/areas of study)
  { key: "guitar", label: "Guitar", Icon: MusicNoteIcon, category: "Music – Disciplines" },
  { key: "drums", label: "Drums", Icon: AudiotrackIcon, category: "Music – Disciplines" },
  { key: "bass", label: "Bass", Icon: QueueMusicIcon, category: "Music – Disciplines" },
  { key: "vocals", label: "Vocals", Icon: MicIcon, category: "Music – Disciplines" },
  { key: "dj", label: "DJ / Turntables", Icon: GraphicEqIcon, category: "Music – Disciplines" },
  { key: "songwriting", label: "Songwriting", Icon: LibraryMusicIcon, category: "Music – Disciplines" },
  { key: "strings", label: "Strings (Violin / Cello)", Icon: MusicNoteIcon, category: "Music – Disciplines" },
  { key: "brass", label: "Brass (Trumpet / Trombone)", Icon: MusicNoteIcon, category: "Music – Disciplines" },
  { key: "woodwinds", label: "Woodwinds (Sax / Clarinet)", Icon: MusicNoteIcon, category: "Music – Disciplines" },
  { key: "soundEngineering", label: "Sound Engineering", Icon: EqualizerIcon, category: "Music – Disciplines" },
  { key: "digitalProduction", label: "Digital Production", Icon: ComputerIcon, category: "Music – Disciplines" },
  // Arts
  { key: "brush", label: "Brush", Icon: BrushIcon, category: "Arts" },
  { key: "brushAlt", label: "Brush (Outlined)", Icon: BrushOutlinedIcon, category: "Arts" },
  { key: "palette", label: "Palette", Icon: PaletteIcon, category: "Arts" },
  { key: "theater", label: "Theater Masks", Icon: TheaterComedyIcon, category: "Arts" },
  { key: "theaterAlt", label: "Theater Masks (Outlined)", Icon: TheaterComedyOutlinedIcon, category: "Arts" },
  { key: "photoCamera", label: "Camera", Icon: PhotoCameraIcon, category: "Arts" },
  { key: "image", label: "Image", Icon: ImageIcon, category: "Arts" },
  { key: "movie", label: "Movie / Video", Icon: MovieIcon, category: "Arts" },
  { key: "slideshow", label: "Slideshow", Icon: SlideshowIcon, category: "Arts" },
  // People & community
  { key: "people", label: "People", Icon: PeopleIcon, category: "People" },
  { key: "group", label: "Group", Icon: GroupIcon, category: "People" },
  { key: "diversity1", label: "Diversity 1", Icon: Diversity1Icon, category: "People" },
  { key: "diversity2", label: "Diversity 2", Icon: Diversity2Icon, category: "People" },
  { key: "diversity3", label: "Diversity 3", Icon: Diversity3Icon, category: "People" },
  { key: "faceYouth", label: "Youth Face", Icon: Face6Icon, category: "People" },
  { key: "faceAlt", label: "Face", Icon: Face3Icon, category: "People" },
  // Emotions
  { key: "emojiEmotions", label: "Emoji Emotions", Icon: EmojiEmotionsIcon, category: "Emotions" },
  { key: "sentimentVerySatisfied", label: "Very Satisfied", Icon: SentimentVerySatisfiedIcon, category: "Emotions" },
  { key: "sentimentSatisfiedAlt", label: "Satisfied", Icon: SentimentSatisfiedAltIcon, category: "Emotions" },
  { key: "sentimentNeutral", label: "Neutral", Icon: SentimentNeutralIcon, category: "Emotions" },
  { key: "sentimentDissatisfied", label: "Dissatisfied", Icon: SentimentDissatisfiedIcon, category: "Emotions" },
  { key: "favorite", label: "Heart", Icon: FavoriteIcon, category: "Emotions" },
  { key: "favoriteBorder", label: "Heart (Border)", Icon: FavoriteBorderIcon, category: "Emotions" },
  // Education & learning
  { key: "school", label: "School", Icon: SchoolIcon, category: "Education" },
  { key: "menuBook", label: "Book", Icon: MenuBookIcon, category: "Education" },
  { key: "libraryBooks", label: "Library Books", Icon: LibraryBooksIcon, category: "Education" },
  { key: "localLibrary", label: "Local Library", Icon: LocalLibraryIcon, category: "Education" },
  { key: "note", label: "Note", Icon: NoteIcon, category: "Education" },
  { key: "notes", label: "Notes", Icon: NotesIcon, category: "Education" },
  { key: "article", label: "Article", Icon: ArticleIcon, category: "Education" },
  // Achievements
  { key: "emojiEvents", label: "Trophy", Icon: EmojiEventsIcon, category: "Achievements" },
  { key: "workspacePremium", label: "Badge", Icon: WorkspacePremiumIcon, category: "Achievements" },
  { key: "star", label: "Star", Icon: StarIcon, category: "Achievements" },
  { key: "starBorder", label: "Star Border", Icon: StarBorderIcon, category: "Achievements" },
  { key: "starOutline", label: "Star Outline", Icon: StarOutlineIcon, category: "Achievements" },
  { key: "checkCircle", label: "Check Circle", Icon: CheckCircleIcon, category: "Achievements" },
  // Impact & data
  { key: "timeline", label: "Timeline", Icon: TimelineIcon, category: "Impact" },
  { key: "barChart", label: "Bar Chart", Icon: BarChartIcon, category: "Impact" },
  { key: "pieChart", label: "Pie Chart", Icon: PieChartIcon, category: "Impact" },
  { key: "showChart", label: "Trend Line", Icon: ShowChartIcon, category: "Impact" },
  { key: "autoGraph", label: "Auto Graph", Icon: AutoGraphIcon, category: "Impact" },
  { key: "trendingUp", label: "Trending Up", Icon: TrendingUpIcon, category: "Impact" },
  { key: "trendingFlat", label: "Trending Flat", Icon: TrendingFlatIcon, category: "Impact" },
  { key: "adjust", label: "Adjust", Icon: AdjustIcon, category: "Impact" },
  { key: "circle", label: "Circle", Icon: CircleIcon, category: "Impact" },
  { key: "radioButton", label: "Radio Button", Icon: RadioButtonUncheckedIcon, category: "Impact" },
  // Places
  { key: "map", label: "Map", Icon: MapIcon, category: "Places" },
  { key: "place", label: "Place Pin", Icon: PlaceIcon, category: "Places" },
  { key: "public", label: "Globe", Icon: PublicIcon, category: "Places" },
  { key: "locationCity", label: "City", Icon: LocationCityIcon, category: "Places" },
  // Time
  { key: "accessTime", label: "Clock", Icon: AccessTimeIcon, category: "Time" },
  { key: "dateRange", label: "Date Range", Icon: DateRangeIcon, category: "Time" },
  { key: "event", label: "Event", Icon: EventIcon, category: "Time" },
  // Support & mentorship
  { key: "volunteerActivism", label: "Volunteer", Icon: VolunteerActivismIcon, category: "Support" },
  { key: "handshake", label: "Handshake", Icon: HandshakeIcon, category: "Support" },
  { key: "diversitySupport", label: "Community", Icon: Diversity3Icon, category: "Support" },
  // Work & career
  { key: "work", label: "Briefcase", Icon: WorkIcon, category: "Work" },
  // Ideas & growth
  { key: "lightbulb", label: "Lightbulb", Icon: LightbulbIcon, category: "Ideas" },
  { key: "psychology", label: "Psychology", Icon: PsychologyIcon, category: "Ideas" },
  { key: "psychologyAlt", label: "Psychology Alt", Icon: PsychologyAltIcon, category: "Ideas" },
  // Communication
  { key: "chat", label: "Chat", Icon: ChatIcon, category: "Communication" },
  { key: "chatBubble", label: "Speech Bubble", Icon: ChatBubbleIcon, category: "Communication" },
  { key: "recordVoiceOver", label: "Record Voice Over", Icon: RecordVoiceOverIcon, category: "Communication" },
  { key: "recordVoiceOverAlt", label: "Record Voice Over (Alt)", Icon: RecordVoiceOverOutlinedIcon, category: "Communication" },
  { key: "campaign", label: "Campaign", Icon: CampaignIcon, category: "Communication" },
  { key: "forum", label: "Forum", Icon: ForumIcon, category: "Communication" },
  { key: "headsetMic", label: "Headset Mic", Icon: HeadsetMicIcon, category: "Communication" },
  // Tech & tools
  { key: "computer", label: "Computer", Icon: ComputerIcon, category: "Tech" },
  { key: "cloudQueue", label: "Cloud", Icon: CloudQueueIcon, category: "Tech" },
  { key: "bolt", label: "Bolt / Energy", Icon: BoltIcon, category: "Tech" },
  // Exploration & motion
  { key: "rocketLaunch", label: "Rocket Launch", Icon: RocketLaunchIcon, category: "Exploration" },
  { key: "explore", label: "Compass", Icon: ExploreIcon, category: "Exploration" },
  { key: "directionsRun", label: "Run / Movement", Icon: DirectionsRunIcon, category: "Exploration" },
  { key: "directionsWalk", label: "Walk", Icon: DirectionsWalkIcon, category: "Exploration" },
  { key: "directionsBike", label: "Bike", Icon: DirectionsBikeIcon, category: "Exploration" },
  { key: "directionsBus", label: "Bus", Icon: DirectionsBusIcon, category: "Exploration" },
  // Sports & activities
  { key: "sportsBasketball", label: "Basketball", Icon: SportsBasketballIcon, category: "Activities" },
  { key: "sportsSoccer", label: "Soccer", Icon: SportsSoccerIcon, category: "Activities" },
  { key: "sportsHandball", label: "Handball", Icon: SportsHandballIcon, category: "Activities" },
  { key: "sportsKabaddi", label: "Kabaddi", Icon: SportsKabaddiIcon, category: "Activities" },
  { key: "sportsEsports", label: "Esports", Icon: SportsEsportsIcon, category: "Activities" },
  // Local experience
  { key: "localActivity", label: "Ticket / Activity", Icon: LocalActivityIcon, category: "Local" },
  { key: "localOffer", label: "Offer / Tag", Icon: LocalOfferIcon, category: "Local" },
];

export const getImpactIconByKey = (key?: ImpactIconKey | null) => {
  if (!key) return null;
  const found = IMPACT_ICON_LIBRARY.find((i) => i.key === key);
  return found ?? null;
};

export interface IconSelectorProps {
  label?: string;
  value: ImpactIconKey | "";
  onChange: (key: ImpactIconKey | "") => void;
  allowNone?: boolean;
  noneLabel?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Reusable icon selector with search, backed by IMPACT_ICON_LIBRARY.
 * This is designed for admin forms (mission stats, disciplines, badges, etc.).
 */
export function IconSelector({
  label = "Icon",
  value,
  onChange,
  allowNone = true,
  noneLabel = "Default",
  helperText,
  fullWidth = true,
}: IconSelectorProps) {
  const selected =
    IMPACT_ICON_LIBRARY.find((icon) => icon.key === value) ?? null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      <Autocomplete
        options={IMPACT_ICON_LIBRARY}
        value={selected}
        onChange={(_, newValue) => {
          if (!newValue) {
            if (allowNone) onChange("");
            return;
          }
          onChange(newValue.key);
        }}
        getOptionLabel={(option) => option.label}
        filterOptions={(icons, state) => {
          const term = state.inputValue.trim().toLowerCase();
          if (!term) return icons;
          return icons.filter((icon) => {
            return (
              icon.label.toLowerCase().includes(term) ||
              icon.key.toLowerCase().includes(term) ||
              icon.category.toLowerCase().includes(term)
            );
          });
        }}
        renderOption={(props, icon) => {
          const Icon = icon.Icon;
          return (
            <MenuItem {...props} key={icon.key} value={icon.key}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Icon fontSize="small" />
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="body2">{icon.label}</Typography>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.7 }}
                  >{`key: ${icon.key}`}</Typography>
                </Box>
              </Box>
            </MenuItem>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder="Search icons..."
            helperText={helperText}
            fullWidth={fullWidth}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "rgba(255, 255, 255, 0.06)",
                WebkitBackdropFilter: "blur(8px) saturate(140%)",
                backdropFilter: "blur(8px) saturate(140%)",
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: COLORS.gogo_blue,
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
                "&.Mui-focused": {
                  color: COLORS.gogo_blue,
                },
              },
            }}
          />
        )}
        clearOnEscape
        autoHighlight
        openOnFocus
        blurOnSelect
      />
    </Box>
  );
}

export default IconSelector;


