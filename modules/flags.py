from enum import Enum, IntEnum

class GenerationMode(str, Enum):
    EXTREME_SPEED = "extreme_speed"
    SPEED = "speed"
    QUALITY = "quality"

class Performance(Enum):
    QUALITY = 'Quality'
    SPEED = 'Speed'
    EXTREME_SPEED = 'Extreme Speed'
    LIGHTNING = 'Lightning'
    HYPER_SD = 'Hyper-SD'

    @classmethod
    def list(cls) -> list:
        return list(map(lambda c: (c.name, c.value), cls))

    @classmethod
    def values(cls) -> list:
        return list(map(lambda c: c.value, cls))

class OutputFormat(Enum):
    PNG = 'png'
    JPEG = 'jpeg'
    WEBP = 'webp'
    
    @classmethod
    def list(cls) -> list:
        return list(map(lambda c: c.value, cls))

# Common Flag Lists
uov_list = [
    'Disabled', 'Vary (Subtle)', 'Vary (Strong)', 'Upscale (1.5x)', 'Upscale (2x)', 'Upscale (Fast 2x)'
]

inpaint_options = [
    'Inpaint or Outpaint (default)', 
    'Improve Detail (face, hand, eyes, etc.)', 
    'Modify Content (add objects, change background, etc.)'
]

aspect_ratios = [
    '704*1408', '704*1344', '768*1344', '768*1280', '832*1216', '832*1152',
    '896*1152', '896*1088', '960*1088', '960*1024', '1024*1024', '1024*960',
    '1088*960', '1088*896', '1152*896', '1152*832', '1216*832', '1280*768',
    '1344*768', '1344*704', '1408*704', '1472*704', '1536*640', '1600*640',
    '1664*576', '1728*576'
]
