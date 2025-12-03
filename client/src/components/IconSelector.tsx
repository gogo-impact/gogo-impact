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
// React Icons - Game Icons (instruments)
import {
  GiGuitar,
  GiGuitarBassHead,
  GiDrum,
  GiViolin,
  GiTrumpet,
  GiSaxophone,
  GiHarp,
  GiBanjo,
  GiPanFlute,
  GiAccordion,
  GiMusicalKeyboard,
  GiClarinet,
  GiTrombone,
  GiMaracas,
  GiXylophone,
  GiBugleCall,
  GiMicrophone,
  GiDrumKit,
  GiGrandPiano,
  GiAcrobatic, // Dance alternative
  GiTalk,
  // High-impact icons for youth mentorship & music education
  GiTeacher,
  GiGrowth,
  GiHeartBeats,
  GiMeditation,
  GiPublicSpeaker,
  GiTorch,
  GiLaurelCrown,
  GiStairsGoal,
  GiHand, // Raised hand alternative
  GiTeamIdea,
  GiGraduateCap,
  GiOpenBook,
  GiMagicLamp,
  GiStarSwirl,
  GiSoundWaves,
  GiSparkles,
  GiBrain,
  GiHealing,
  GiPodium,
  GiHumanPyramid,
} from "react-icons/gi";
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
// Additional icons for impact report
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BusinessIcon from "@mui/icons-material/Business";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CakeIcon from "@mui/icons-material/Cake";
import CastForEducationIcon from "@mui/icons-material/CastForEducation";
import CelebrationIcon from "@mui/icons-material/Celebration";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import ChildFriendlyIcon from "@mui/icons-material/ChildFriendly";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import CottageIcon from "@mui/icons-material/Cottage";
import DomainIcon from "@mui/icons-material/Domain";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import EngineeringIcon from "@mui/icons-material/Engineering";
import ExtensionIcon from "@mui/icons-material/Extension";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import GavelIcon from "@mui/icons-material/Gavel";
import GradeIcon from "@mui/icons-material/Grade";
import GradingIcon from "@mui/icons-material/Grading";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import HealingIcon from "@mui/icons-material/Healing";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import InterpreterModeIcon from "@mui/icons-material/InterpreterMode";
import JoinFullIcon from "@mui/icons-material/JoinFull";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import MoneyIcon from "@mui/icons-material/Money";
import MuseumIcon from "@mui/icons-material/Museum";
import NaturePeopleIcon from "@mui/icons-material/NaturePeople";
import PaidIcon from "@mui/icons-material/Paid";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PinDropIcon from "@mui/icons-material/PinDrop";
import PollIcon from "@mui/icons-material/Poll";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import QuizIcon from "@mui/icons-material/Quiz";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RecordingIcon from "@mui/icons-material/FiberManualRecord";
import ReduceCapacityIcon from "@mui/icons-material/ReduceCapacity";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import SavingsIcon from "@mui/icons-material/Savings";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import SettingsAccessibilityIcon from "@mui/icons-material/SettingsAccessibility";
import SpaIcon from "@mui/icons-material/Spa";
import SpeedIcon from "@mui/icons-material/Speed";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import StadiumIcon from "@mui/icons-material/Stadium";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SupportIcon from "@mui/icons-material/Support";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import TheatersTwoToneIcon from "@mui/icons-material/Theaters";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import TodayIcon from "@mui/icons-material/Today";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TuneIcon from "@mui/icons-material/Tune";
import VerifiedIcon from "@mui/icons-material/Verified";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import VoiceChatIcon from "@mui/icons-material/VoiceChat";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
// WellnessIcon removed - duplicate of SpaIcon
import WhatshotIcon from "@mui/icons-material/Whatshot";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import ElderlyIcon from "@mui/icons-material/Elderly";
import Face2Icon from "@mui/icons-material/Face2";
import Face4Icon from "@mui/icons-material/Face4";
import Face5Icon from "@mui/icons-material/Face5";
import MicExternalOnIcon from "@mui/icons-material/MicExternalOn";
import MicNoneIcon from "@mui/icons-material/MicNone";
import NightlifeIcon from "@mui/icons-material/Nightlife";
import BalanceIcon from "@mui/icons-material/Balance";
import AssuredWorkloadIcon from "@mui/icons-material/AssuredWorkload";
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
  {
    key: "homeOutlined",
    label: "Home (Outlined)",
    Icon: HomeOutlinedIcon,
    category: "Navigation",
  },
  {
    key: "flagOutlined",
    label: "Flag / Mission",
    Icon: FlagOutlinedIcon,
    category: "Navigation",
  },
  {
    key: "groupsOutlined",
    label: "Groups / Who We Serve",
    Icon: GroupsOutlinedIcon,
    category: "Navigation",
  },
  {
    key: "savingsOutlined",
    label: "Savings / Financials",
    Icon: SavingsOutlinedIcon,
    category: "Navigation",
  },
  {
    key: "tuneOutlined",
    label: "Tune / Method",
    Icon: TuneOutlinedIcon,
    category: "Navigation",
  },
  {
    key: "menuBookOutlined",
    label: "Curriculum (Outlined)",
    Icon: MenuBookOutlinedIcon,
    category: "Navigation",
  },
  {
    key: "equalizerOutlined",
    label: "Impact Equalizer (Outlined)",
    Icon: EqualizerOutlinedIcon,
    category: "Navigation",
  },
  {
    key: "formatQuoteOutlined",
    label: "Quote (Outlined)",
    Icon: FormatQuoteOutlinedIcon,
    category: "Navigation",
  },
  {
    key: "placeOutlined",
    label: "Location Pin (Outlined)",
    Icon: PlaceOutlinedIcon,
    category: "Navigation",
  },
  {
    key: "insightsOutlined",
    label: "Insights / Levels",
    Icon: InsightsOutlinedIcon,
    category: "Navigation",
  },
  {
    key: "handshakeOutlined",
    label: "Handshake (Outlined)",
    Icon: HandshakeOutlinedIcon,
    category: "Support",
  },
  {
    key: "mailOutline",
    label: "Mail / Contact (Outlined)",
    Icon: MailOutlineOutlinedIcon,
    category: "Communication",
  },
  // Social
  {
    key: "facebook",
    label: "Facebook",
    Icon: FacebookIcon,
    category: "Social",
  },
  {
    key: "instagram",
    label: "Instagram",
    Icon: InstagramIcon,
    category: "Social",
  },
  { key: "twitter", label: "Twitter", Icon: TwitterIcon, category: "Social" },
  { key: "youtube", label: "YouTube", Icon: YouTubeIcon, category: "Social" },
  // Music & audio
  {
    key: "musicNote",
    label: "Music Note",
    Icon: MusicNoteIcon,
    category: "Music",
  },
  {
    key: "graphicEq",
    label: "Graphic EQ",
    Icon: GraphicEqIcon,
    category: "Music",
  },
  { key: "mic", label: "Microphone", Icon: MicIcon, category: "Music" },
  { key: "pianoMui", label: "Piano (Simple)", Icon: PianoIcon, category: "Music" },
  {
    key: "audiotrack",
    label: "Audio Track",
    Icon: AudiotrackIcon,
    category: "Music",
  },
  {
    key: "queueMusic",
    label: "Queue Music",
    Icon: QueueMusicIcon,
    category: "Music",
  },
  {
    key: "queueMusicAlt",
    label: "Queue Music (Outlined)",
    Icon: QueueMusicOutlinedIcon,
    category: "Music",
  },
  {
    key: "headphones",
    label: "Headphones",
    Icon: HeadphonesIcon,
    category: "Music",
  },
  {
    key: "musicVideo",
    label: "Music Video",
    Icon: MusicVideoIcon,
    category: "Music",
  },
  {
    key: "libraryMusic",
    label: "Library Music",
    Icon: LibraryMusicIcon,
    category: "Music",
  },
  {
    key: "equalizer",
    label: "Equalizer",
    Icon: EqualizerIcon,
    category: "Music",
  },
  { key: "album", label: "Album", Icon: AlbumIcon, category: "Music" },
  {
    key: "volumeUp",
    label: "Volume Up",
    Icon: VolumeUpIcon,
    category: "Music",
  },
  {
    key: "volumeDown",
    label: "Volume Down",
    Icon: VolumeDownIcon,
    category: "Music",
  },
  {
    key: "volumeOff",
    label: "Volume Off",
    Icon: VolumeOffIcon,
    category: "Music",
  },
  {
    key: "volumeMute",
    label: "Volume Mute",
    Icon: VolumeMuteIcon,
    category: "Music",
  },
  { key: "headset", label: "Headset", Icon: HeadsetIcon, category: "Music" },
  { key: "radio", label: "Radio", Icon: RadioIcon, category: "Music" },
  {
    key: "surroundSound",
    label: "Surround Sound",
    Icon: SurroundSoundIcon,
    category: "Music",
  },
  { key: "speaker", label: "Speaker", Icon: SpeakerIcon, category: "Music" },
  {
    key: "speakerGroup",
    label: "Speaker Group",
    Icon: SpeakerGroupIcon,
    category: "Music",
  },
  {
    key: "musicOff",
    label: "Music Off",
    Icon: MusicOffIcon,
    category: "Music",
  },
  {
    key: "playlistPlay",
    label: "Playlist Play",
    Icon: PlaylistPlayIcon,
    category: "Music",
  },
  {
    key: "queuePlayNext",
    label: "Queue Play Next",
    Icon: QueuePlayNextIcon,
    category: "Music",
  },
  {
    key: "videoLibrary",
    label: "Video Library",
    Icon: VideoLibraryIcon,
    category: "Music",
  },
  // Music disciplines - Instruments (using react-icons/gi for actual instrument icons)
  {
    key: "guitar",
    label: "Guitar",
    Icon: GiGuitar,
    category: "Music – Instruments",
  },
  {
    key: "bass",
    label: "Bass Guitar",
    Icon: GiGuitarBassHead,
    category: "Music – Instruments",
  },
  {
    key: "drums",
    label: "Drums",
    Icon: GiDrumKit,
    category: "Music – Instruments",
  },
  {
    key: "drum",
    label: "Drum (Single)",
    Icon: GiDrum,
    category: "Music – Instruments",
  },
  {
    key: "piano",
    label: "Grand Piano",
    Icon: GiGrandPiano,
    category: "Music – Instruments",
  },
  {
    key: "keyboard",
    label: "Keyboard",
    Icon: GiMusicalKeyboard,
    category: "Music – Instruments",
  },
  {
    key: "violin",
    label: "Violin",
    Icon: GiViolin,
    category: "Music – Instruments",
  },
  {
    key: "strings",
    label: "Strings (Violin / Cello)",
    Icon: GiViolin,
    category: "Music – Instruments",
  },
  {
    key: "trumpet",
    label: "Trumpet",
    Icon: GiTrumpet,
    category: "Music – Instruments",
  },
  {
    key: "trombone",
    label: "Trombone",
    Icon: GiTrombone,
    category: "Music – Instruments",
  },
  {
    key: "brass",
    label: "Brass (Trumpet / Trombone)",
    Icon: GiTrumpet,
    category: "Music – Instruments",
  },
  {
    key: "saxophone",
    label: "Saxophone",
    Icon: GiSaxophone,
    category: "Music – Instruments",
  },
  {
    key: "clarinet",
    label: "Clarinet",
    Icon: GiClarinet,
    category: "Music – Instruments",
  },
  {
    key: "woodwinds",
    label: "Woodwinds (Sax / Clarinet)",
    Icon: GiSaxophone,
    category: "Music – Instruments",
  },
  {
    key: "flute",
    label: "Flute / Pan Flute",
    Icon: GiPanFlute,
    category: "Music – Instruments",
  },
  {
    key: "harp",
    label: "Harp",
    Icon: GiHarp,
    category: "Music – Instruments",
  },
  {
    key: "banjo",
    label: "Banjo",
    Icon: GiBanjo,
    category: "Music – Instruments",
  },
  {
    key: "accordion",
    label: "Accordion",
    Icon: GiAccordion,
    category: "Music – Instruments",
  },
  {
    key: "xylophone",
    label: "Xylophone / Percussion",
    Icon: GiXylophone,
    category: "Music – Instruments",
  },
  {
    key: "maracas",
    label: "Maracas",
    Icon: GiMaracas,
    category: "Music – Instruments",
  },
  {
    key: "bugle",
    label: "Bugle / Horn",
    Icon: GiBugleCall,
    category: "Music – Instruments",
  },
  // Music disciplines - Study Areas
  {
    key: "vocals",
    label: "Vocals",
    Icon: GiMicrophone,
    category: "Music – Disciplines",
  },
  {
    key: "dj",
    label: "DJ / Turntables",
    Icon: GraphicEqIcon,
    category: "Music – Disciplines",
  },
  {
    key: "songwriting",
    label: "Songwriting",
    Icon: LibraryMusicIcon,
    category: "Music – Disciplines",
  },
  {
    key: "soundEngineering",
    label: "Sound Engineering",
    Icon: EqualizerIcon,
    category: "Music – Disciplines",
  },
  {
    key: "digitalProduction",
    label: "Digital Production",
    Icon: ComputerIcon,
    category: "Music – Disciplines",
  },
  {
    key: "dance",
    label: "Dance / Acrobatic",
    Icon: GiAcrobatic,
    category: "Music – Disciplines",
  },
  {
    key: "talk",
    label: "Person Talking",
    Icon: GiTalk,
    category: "Communication",
  },
  // NEW: High-impact icons for youth mentorship & music education
  {
    key: "teacher",
    label: "Teacher / Mentor",
    Icon: GiTeacher,
    category: "Mentorship",
  },
  {
    key: "growth",
    label: "Growth / Development",
    Icon: GiGrowth,
    category: "Impact",
  },
  {
    key: "heartBeats",
    label: "Heartbeat / Passion",
    Icon: GiHeartBeats,
    category: "Wellbeing",
  },
  {
    key: "meditation",
    label: "Meditation / Mindfulness",
    Icon: GiMeditation,
    category: "Wellbeing",
  },
  {
    key: "publicSpeaker",
    label: "Public Speaker / Voice",
    Icon: GiPublicSpeaker,
    category: "Communication",
  },
  {
    key: "torch",
    label: "Torch / Leadership",
    Icon: GiTorch,
    category: "Achievements",
  },
  {
    key: "laurelCrown",
    label: "Laurel Crown / Victory",
    Icon: GiLaurelCrown,
    category: "Achievements",
  },
  {
    key: "stairsGoal",
    label: "Stairs / Goals",
    Icon: GiStairsGoal,
    category: "Impact",
  },
  {
    key: "raisedHand",
    label: "Hand / Participation",
    Icon: GiHand,
    category: "Education",
  },
  {
    key: "teamIdea",
    label: "Team Idea / Collaboration",
    Icon: GiTeamIdea,
    category: "Mentorship",
  },
  {
    key: "graduateCap",
    label: "Graduate Cap",
    Icon: GiGraduateCap,
    category: "Education",
  },
  {
    key: "openBook",
    label: "Open Book / Learning",
    Icon: GiOpenBook,
    category: "Education",
  },
  {
    key: "magicLamp",
    label: "Magic Lamp / Dreams",
    Icon: GiMagicLamp,
    category: "Ideas",
  },
  {
    key: "starSwirl",
    label: "Star Swirl / Magic",
    Icon: GiStarSwirl,
    category: "Achievements",
  },
  {
    key: "soundWaves",
    label: "Sound Waves / Audio",
    Icon: GiSoundWaves,
    category: "Music",
  },
  {
    key: "sparkles",
    label: "Sparkles / Creativity",
    Icon: GiSparkles,
    category: "Ideas",
  },
  {
    key: "brain",
    label: "Brain / Learning",
    Icon: GiBrain,
    category: "Education",
  },
  {
    key: "healingHands",
    label: "Healing / Care",
    Icon: GiHealing,
    category: "Wellbeing",
  },
  {
    key: "podium",
    label: "Podium / Performance",
    Icon: GiPodium,
    category: "Achievements",
  },
  {
    key: "humanPyramid",
    label: "Human Pyramid / Community",
    Icon: GiHumanPyramid,
    category: "People",
  },
  // Arts
  { key: "brush", label: "Brush", Icon: BrushIcon, category: "Arts" },
  {
    key: "brushAlt",
    label: "Brush (Outlined)",
    Icon: BrushOutlinedIcon,
    category: "Arts",
  },
  { key: "palette", label: "Palette", Icon: PaletteIcon, category: "Arts" },
  {
    key: "theater",
    label: "Theater Masks",
    Icon: TheaterComedyIcon,
    category: "Arts",
  },
  {
    key: "theaterAlt",
    label: "Theater Masks (Outlined)",
    Icon: TheaterComedyOutlinedIcon,
    category: "Arts",
  },
  {
    key: "photoCamera",
    label: "Camera",
    Icon: PhotoCameraIcon,
    category: "Arts",
  },
  { key: "image", label: "Image", Icon: ImageIcon, category: "Arts" },
  { key: "movie", label: "Movie / Video", Icon: MovieIcon, category: "Arts" },
  {
    key: "slideshow",
    label: "Slideshow",
    Icon: SlideshowIcon,
    category: "Arts",
  },
  // People & community
  { key: "people", label: "People", Icon: PeopleIcon, category: "People" },
  { key: "group", label: "Group", Icon: GroupIcon, category: "People" },
  {
    key: "diversity1",
    label: "Diversity 1",
    Icon: Diversity1Icon,
    category: "People",
  },
  {
    key: "diversity2",
    label: "Diversity 2",
    Icon: Diversity2Icon,
    category: "People",
  },
  {
    key: "diversity3",
    label: "Diversity 3",
    Icon: Diversity3Icon,
    category: "People",
  },
  {
    key: "faceYouth",
    label: "Youth Face",
    Icon: Face6Icon,
    category: "People",
  },
  { key: "faceAlt", label: "Face", Icon: Face3Icon, category: "People" },
  // Emotions
  {
    key: "emojiEmotions",
    label: "Emoji Emotions",
    Icon: EmojiEmotionsIcon,
    category: "Emotions",
  },
  {
    key: "sentimentVerySatisfied",
    label: "Very Satisfied",
    Icon: SentimentVerySatisfiedIcon,
    category: "Emotions",
  },
  {
    key: "sentimentSatisfiedAlt",
    label: "Satisfied",
    Icon: SentimentSatisfiedAltIcon,
    category: "Emotions",
  },
  {
    key: "sentimentNeutral",
    label: "Neutral",
    Icon: SentimentNeutralIcon,
    category: "Emotions",
  },
  {
    key: "sentimentDissatisfied",
    label: "Dissatisfied",
    Icon: SentimentDissatisfiedIcon,
    category: "Emotions",
  },
  { key: "favorite", label: "Heart", Icon: FavoriteIcon, category: "Emotions" },
  {
    key: "favoriteBorder",
    label: "Heart (Border)",
    Icon: FavoriteBorderIcon,
    category: "Emotions",
  },
  // Education & learning
  { key: "school", label: "School", Icon: SchoolIcon, category: "Education" },
  { key: "menuBook", label: "Book", Icon: MenuBookIcon, category: "Education" },
  {
    key: "libraryBooks",
    label: "Library Books",
    Icon: LibraryBooksIcon,
    category: "Education",
  },
  {
    key: "localLibrary",
    label: "Local Library",
    Icon: LocalLibraryIcon,
    category: "Education",
  },
  { key: "note", label: "Note", Icon: NoteIcon, category: "Education" },
  { key: "notes", label: "Notes", Icon: NotesIcon, category: "Education" },
  {
    key: "article",
    label: "Article",
    Icon: ArticleIcon,
    category: "Education",
  },
  // Achievements
  {
    key: "emojiEvents",
    label: "Trophy",
    Icon: EmojiEventsIcon,
    category: "Achievements",
  },
  {
    key: "workspacePremium",
    label: "Badge",
    Icon: WorkspacePremiumIcon,
    category: "Achievements",
  },
  { key: "star", label: "Star", Icon: StarIcon, category: "Achievements" },
  {
    key: "starBorder",
    label: "Star Border",
    Icon: StarBorderIcon,
    category: "Achievements",
  },
  {
    key: "starOutline",
    label: "Star Outline",
    Icon: StarOutlineIcon,
    category: "Achievements",
  },
  {
    key: "checkCircle",
    label: "Check Circle",
    Icon: CheckCircleIcon,
    category: "Achievements",
  },
  // Impact & data
  {
    key: "timeline",
    label: "Timeline",
    Icon: TimelineIcon,
    category: "Impact",
  },
  {
    key: "barChart",
    label: "Bar Chart",
    Icon: BarChartIcon,
    category: "Impact",
  },
  {
    key: "pieChart",
    label: "Pie Chart",
    Icon: PieChartIcon,
    category: "Impact",
  },
  {
    key: "showChart",
    label: "Trend Line",
    Icon: ShowChartIcon,
    category: "Impact",
  },
  {
    key: "autoGraph",
    label: "Auto Graph",
    Icon: AutoGraphIcon,
    category: "Impact",
  },
  {
    key: "trendingUp",
    label: "Trending Up",
    Icon: TrendingUpIcon,
    category: "Impact",
  },
  {
    key: "trendingFlat",
    label: "Trending Flat",
    Icon: TrendingFlatIcon,
    category: "Impact",
  },
  { key: "adjust", label: "Adjust", Icon: AdjustIcon, category: "Impact" },
  { key: "circle", label: "Circle", Icon: CircleIcon, category: "Impact" },
  {
    key: "radioButton",
    label: "Radio Button",
    Icon: RadioButtonUncheckedIcon,
    category: "Impact",
  },
  // Places
  { key: "map", label: "Map", Icon: MapIcon, category: "Places" },
  { key: "place", label: "Place Pin", Icon: PlaceIcon, category: "Places" },
  { key: "public", label: "Globe", Icon: PublicIcon, category: "Places" },
  {
    key: "locationCity",
    label: "City",
    Icon: LocationCityIcon,
    category: "Places",
  },
  // Time
  { key: "accessTime", label: "Clock", Icon: AccessTimeIcon, category: "Time" },
  {
    key: "dateRange",
    label: "Date Range",
    Icon: DateRangeIcon,
    category: "Time",
  },
  { key: "event", label: "Event", Icon: EventIcon, category: "Time" },
  // Support & mentorship
  {
    key: "volunteerActivism",
    label: "Volunteer",
    Icon: VolunteerActivismIcon,
    category: "Support",
  },
  {
    key: "handshake",
    label: "Handshake",
    Icon: HandshakeIcon,
    category: "Support",
  },
  // Work & career
  { key: "work", label: "Briefcase", Icon: WorkIcon, category: "Work" },
  // Ideas & growth
  {
    key: "lightbulb",
    label: "Lightbulb",
    Icon: LightbulbIcon,
    category: "Ideas",
  },
  {
    key: "psychology",
    label: "Psychology",
    Icon: PsychologyIcon,
    category: "Ideas",
  },
  {
    key: "psychologyAlt",
    label: "Psychology Alt",
    Icon: PsychologyAltIcon,
    category: "Ideas",
  },
  // Communication
  { key: "chat", label: "Chat", Icon: ChatIcon, category: "Communication" },
  {
    key: "chatBubble",
    label: "Speech Bubble",
    Icon: ChatBubbleIcon,
    category: "Communication",
  },
  {
    key: "recordVoiceOver",
    label: "Record Voice Over",
    Icon: RecordVoiceOverIcon,
    category: "Communication",
  },
  {
    key: "recordVoiceOverAlt",
    label: "Record Voice Over (Alt)",
    Icon: RecordVoiceOverOutlinedIcon,
    category: "Communication",
  },
  {
    key: "campaign",
    label: "Campaign",
    Icon: CampaignIcon,
    category: "Communication",
  },
  { key: "forum", label: "Forum", Icon: ForumIcon, category: "Communication" },
  {
    key: "headsetMic",
    label: "Headset Mic",
    Icon: HeadsetMicIcon,
    category: "Communication",
  },
  // Tech & tools
  { key: "computer", label: "Computer", Icon: ComputerIcon, category: "Tech" },
  { key: "cloudQueue", label: "Cloud", Icon: CloudQueueIcon, category: "Tech" },
  { key: "bolt", label: "Bolt / Energy", Icon: BoltIcon, category: "Tech" },
  // Exploration & motion
  {
    key: "rocketLaunch",
    label: "Rocket Launch",
    Icon: RocketLaunchIcon,
    category: "Exploration",
  },
  {
    key: "explore",
    label: "Compass",
    Icon: ExploreIcon,
    category: "Exploration",
  },
  {
    key: "directionsRun",
    label: "Run / Movement",
    Icon: DirectionsRunIcon,
    category: "Exploration",
  },
  {
    key: "directionsWalk",
    label: "Walk",
    Icon: DirectionsWalkIcon,
    category: "Exploration",
  },
  {
    key: "directionsBike",
    label: "Bike",
    Icon: DirectionsBikeIcon,
    category: "Exploration",
  },
  {
    key: "directionsBus",
    label: "Bus",
    Icon: DirectionsBusIcon,
    category: "Exploration",
  },
  // Sports & activities
  {
    key: "sportsBasketball",
    label: "Basketball",
    Icon: SportsBasketballIcon,
    category: "Activities",
  },
  {
    key: "sportsSoccer",
    label: "Soccer",
    Icon: SportsSoccerIcon,
    category: "Activities",
  },
  {
    key: "sportsHandball",
    label: "Handball",
    Icon: SportsHandballIcon,
    category: "Activities",
  },
  {
    key: "sportsKabaddi",
    label: "Kabaddi",
    Icon: SportsKabaddiIcon,
    category: "Activities",
  },
  {
    key: "sportsEsports",
    label: "Esports",
    Icon: SportsEsportsIcon,
    category: "Activities",
  },
  // Local experience
  {
    key: "localActivity",
    label: "Ticket / Activity",
    Icon: LocalActivityIcon,
    category: "Local",
  },
  {
    key: "localOffer",
    label: "Offer / Tag",
    Icon: LocalOfferIcon,
    category: "Local",
  },
  // =========================================
  // NEW ICONS FOR IMPACT REPORT (50 additions)
  // =========================================
  // Location types for map
  {
    key: "schoolOutlined",
    label: "School (Outlined)",
    Icon: SchoolOutlinedIcon,
    category: "Locations",
  },
  {
    key: "apartment",
    label: "Academy / Apartment",
    Icon: ApartmentIcon,
    category: "Locations",
  },
  {
    key: "cottage",
    label: "Community Center / Cottage",
    Icon: CottageIcon,
    category: "Locations",
  },
  {
    key: "storefront",
    label: "Studio / Storefront",
    Icon: StorefrontIcon,
    category: "Locations",
  },
  {
    key: "domain",
    label: "Hub / Building",
    Icon: DomainIcon,
    category: "Locations",
  },
  {
    key: "homeWork",
    label: "Home Office / Program Site",
    Icon: HomeWorkIcon,
    category: "Locations",
  },
  {
    key: "meetingRoom",
    label: "Meeting Room / Office",
    Icon: MeetingRoomIcon,
    category: "Locations",
  },
  {
    key: "wbSunny",
    label: "Summer Program / Sun",
    Icon: WbSunnyIcon,
    category: "Locations",
  },
  {
    key: "stadium",
    label: "Performance Venue / Stadium",
    Icon: StadiumIcon,
    category: "Locations",
  },
  {
    key: "theatersTwoTone",
    label: "Theater / Venue",
    Icon: TheatersTwoToneIcon,
    category: "Locations",
  },
  {
    key: "museum",
    label: "Museum / Cultural Center",
    Icon: MuseumIcon,
    category: "Locations",
  },
  {
    key: "pinDrop",
    label: "Pin Drop Location",
    Icon: PinDropIcon,
    category: "Locations",
  },
  {
    key: "locationOn",
    label: "Location Marker",
    Icon: LocationOnIcon,
    category: "Locations",
  },
  // Financial / Funding
  {
    key: "accountBalance",
    label: "Foundation / Bank",
    Icon: AccountBalanceIcon,
    category: "Financial",
  },
  {
    key: "attachMoney",
    label: "Money / Dollar",
    Icon: AttachMoneyIcon,
    category: "Financial",
  },
  {
    key: "monetizationOn",
    label: "Monetization / Revenue",
    Icon: MonetizationOnIcon,
    category: "Financial",
  },
  {
    key: "paid",
    label: "Paid / Donation",
    Icon: PaidIcon,
    category: "Financial",
  },
  {
    key: "savings",
    label: "Savings / Piggy Bank",
    Icon: SavingsIcon,
    category: "Financial",
  },
  {
    key: "localAtm",
    label: "ATM / Cash",
    Icon: LocalAtmIcon,
    category: "Financial",
  },
  {
    key: "requestQuote",
    label: "Quote / Invoice",
    Icon: RequestQuoteIcon,
    category: "Financial",
  },
  {
    key: "receiptLong",
    label: "Receipt / Expenses",
    Icon: ReceiptLongIcon,
    category: "Financial",
  },
  {
    key: "money",
    label: "Money Bill",
    Icon: MoneyIcon,
    category: "Financial",
  },
  // Corporate / Business
  {
    key: "business",
    label: "Business / Corporate",
    Icon: BusinessIcon,
    category: "Corporate",
  },
  {
    key: "businessCenter",
    label: "Briefcase / Business Center",
    Icon: BusinessCenterIcon,
    category: "Corporate",
  },
  {
    key: "corporateFare",
    label: "Corporate Building",
    Icon: CorporateFareIcon,
    category: "Corporate",
  },
  {
    key: "workOutline",
    label: "Work (Outlined)",
    Icon: WorkOutlineIcon,
    category: "Corporate",
  },
  // Government
  {
    key: "gavel",
    label: "Government / Gavel",
    Icon: GavelIcon,
    category: "Government",
  },
  {
    key: "assuredWorkload",
    label: "Government Grant",
    Icon: AssuredWorkloadIcon,
    category: "Government",
  },
  {
    key: "balance",
    label: "Justice / Balance",
    Icon: BalanceIcon,
    category: "Government",
  },
  // Youth & Demographics
  {
    key: "childCare",
    label: "Child / Youth",
    Icon: ChildCareIcon,
    category: "Youth",
  },
  {
    key: "childFriendly",
    label: "Child Friendly",
    Icon: ChildFriendlyIcon,
    category: "Youth",
  },
  {
    key: "familyRestroom",
    label: "Family",
    Icon: FamilyRestroomIcon,
    category: "Youth",
  },
  {
    key: "face2",
    label: "Face 2",
    Icon: Face2Icon,
    category: "Youth",
  },
  {
    key: "face4",
    label: "Face 4",
    Icon: Face4Icon,
    category: "Youth",
  },
  {
    key: "face5",
    label: "Face 5",
    Icon: Face5Icon,
    category: "Youth",
  },
  {
    key: "elderly",
    label: "Elderly / Senior",
    Icon: ElderlyIcon,
    category: "Youth",
  },
  {
    key: "cake",
    label: "Birthday / Age",
    Icon: CakeIcon,
    category: "Youth",
  },
  // Mental Health & Wellbeing
  {
    key: "healthAndSafety",
    label: "Health & Safety",
    Icon: HealthAndSafetyIcon,
    category: "Wellbeing",
  },
  {
    key: "healing",
    label: "Healing / Therapy",
    Icon: HealingIcon,
    category: "Wellbeing",
  },
  {
    key: "selfImprovement",
    label: "Self Improvement / Meditation",
    Icon: SelfImprovementIcon,
    category: "Wellbeing",
  },
  {
    key: "spa",
    label: "Wellness / Spa",
    Icon: SpaIcon,
    category: "Wellbeing",
  },
  {
    key: "support",
    label: "Support / Life Ring",
    Icon: SupportIcon,
    category: "Wellbeing",
  },
  // Assessment & Progress
  {
    key: "poll",
    label: "Poll / Survey",
    Icon: PollIcon,
    category: "Assessment",
  },
  {
    key: "quiz",
    label: "Quiz / Assessment",
    Icon: QuizIcon,
    category: "Assessment",
  },
  {
    key: "grading",
    label: "Grading / Evaluation",
    Icon: GradingIcon,
    category: "Assessment",
  },
  {
    key: "trackChanges",
    label: "Track Changes / Progress",
    Icon: TrackChangesIcon,
    category: "Assessment",
  },
  {
    key: "speed",
    label: "Speed / Performance Meter",
    Icon: SpeedIcon,
    category: "Assessment",
  },
  {
    key: "leaderboard",
    label: "Leaderboard / Ranking",
    Icon: LeaderboardIcon,
    category: "Assessment",
  },
  {
    key: "stackedLineChart",
    label: "Stacked Chart / Progress",
    Icon: StackedLineChartIcon,
    category: "Assessment",
  },
  {
    key: "trendingDown",
    label: "Trending Down",
    Icon: TrendingDownIcon,
    category: "Assessment",
  },
  // Achievement & Verification
  {
    key: "taskAlt",
    label: "Task Complete",
    Icon: TaskAltIcon,
    category: "Achievements",
  },
  {
    key: "verified",
    label: "Verified Badge",
    Icon: VerifiedIcon,
    category: "Achievements",
  },
  {
    key: "verifiedUser",
    label: "Verified User",
    Icon: VerifiedUserIcon,
    category: "Achievements",
  },
  {
    key: "howToReg",
    label: "Registered / Approved",
    Icon: HowToRegIcon,
    category: "Achievements",
  },
  {
    key: "grade",
    label: "Star Grade",
    Icon: GradeIcon,
    category: "Achievements",
  },
  {
    key: "thumbUp",
    label: "Thumbs Up / Approval",
    Icon: ThumbUpIcon,
    category: "Achievements",
  },
  {
    key: "celebration",
    label: "Celebration / Success",
    Icon: CelebrationIcon,
    category: "Achievements",
  },
  // Mentorship & Connection
  {
    key: "groupAdd",
    label: "Add Group / Join",
    Icon: GroupAddIcon,
    category: "Mentorship",
  },
  {
    key: "connectWithoutContact",
    label: "Connect / Network",
    Icon: ConnectWithoutContactIcon,
    category: "Mentorship",
  },
  {
    key: "joinFull",
    label: "Join / Unite",
    Icon: JoinFullIcon,
    category: "Mentorship",
  },
  {
    key: "personAdd",
    label: "Add Person / Recruit",
    Icon: PersonAddIcon,
    category: "Mentorship",
  },
  {
    key: "personPin",
    label: "Person Pin / Mentor",
    Icon: PersonPinIcon,
    category: "Mentorship",
  },
  {
    key: "supportAgent",
    label: "Support Agent / Mentor",
    Icon: SupportAgentIcon,
    category: "Mentorship",
  },
  {
    key: "interpreterMode",
    label: "Interpreter / Voice Over",
    Icon: InterpreterModeIcon,
    category: "Mentorship",
  },
  // Music Production & Recording
  {
    key: "micExternalOn",
    label: "External Mic / Recording",
    Icon: MicExternalOnIcon,
    category: "Music – Production",
  },
  {
    key: "micNone",
    label: "Mic (Outlined)",
    Icon: MicNoneIcon,
    category: "Music – Production",
  },
  {
    key: "recording",
    label: "Recording Indicator",
    Icon: RecordingIcon,
    category: "Music – Production",
  },
  {
    key: "voiceChat",
    label: "Voice Chat / Vocal Session",
    Icon: VoiceChatIcon,
    category: "Music – Production",
  },
  {
    key: "tune",
    label: "Tune / Adjust",
    Icon: TuneIcon,
    category: "Music – Production",
  },
  {
    key: "nightlife",
    label: "Nightlife / Performance",
    Icon: NightlifeIcon,
    category: "Music – Production",
  },
  // Education & Training
  {
    key: "castForEducation",
    label: "Cast for Education",
    Icon: CastForEducationIcon,
    category: "Education",
  },
  {
    key: "historyEdu",
    label: "History / Diploma",
    Icon: HistoryEduIcon,
    category: "Education",
  },
  {
    key: "extension",
    label: "Extension / Puzzle",
    Icon: ExtensionIcon,
    category: "Education",
  },
  {
    key: "wysiwyg",
    label: "WYSIWYG / Curriculum",
    Icon: WysiwygIcon,
    category: "Education",
  },
  // Activity & Engagement
  {
    key: "emojiPeople",
    label: "Emoji People / Active",
    Icon: EmojiPeopleIcon,
    category: "Activities",
  },
  {
    key: "settingsAccessibility",
    label: "Accessibility / Inclusion",
    Icon: SettingsAccessibilityIcon,
    category: "Activities",
  },
  {
    key: "naturePeople",
    label: "Nature & People",
    Icon: NaturePeopleIcon,
    category: "Activities",
  },
  {
    key: "reduceCapacity",
    label: "Reduce Capacity / Small Group",
    Icon: ReduceCapacityIcon,
    category: "Activities",
  },
  // Events & Time
  {
    key: "today",
    label: "Today / Calendar",
    Icon: TodayIcon,
    category: "Time",
  },
  // Energy & Passion
  {
    key: "whatshot",
    label: "Hot / Trending",
    Icon: WhatshotIcon,
    category: "Ideas",
  },
  // People variants
  {
    key: "peopleOutline",
    label: "People (Outlined)",
    Icon: PeopleOutlineIcon,
    category: "People",
  },
  {
    key: "permIdentity",
    label: "Identity / Person",
    Icon: PermIdentityIcon,
    category: "People",
  },
  // Technical / Engineering
  {
    key: "engineering",
    label: "Engineering / Technical",
    Icon: EngineeringIcon,
    category: "Tech",
  },
  {
    key: "precisionManufacturing",
    label: "Precision / Production",
    Icon: PrecisionManufacturingIcon,
    category: "Tech",
  },
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
        componentsProps={{
          paper: {
            sx: {
              bgcolor: "rgba(30, 30, 30, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              "& .MuiAutocomplete-option": {
                color: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                "&[aria-selected='true']": { bgcolor: "rgba(255,255,255,0.15)" },
                "&[aria-selected='true']:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              },
            },
          },
        }}
      />
    </Box>
  );
}

export default IconSelector;


