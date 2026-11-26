# Surelin announcements API

The website and Godot game read the same Supabase table: `public.announcements`.

## Public feed

Send a GET request to:

```
https://wobrjedahfhleazgvpkp.supabase.co/rest/v1/announcements?select=id,title,body,created_at&published=eq.true&order=created_at.desc&limit=20
```

Headers:

```
apikey: YOUR_SUPABASE_PUBLISHABLE_KEY
Authorization: Bearer YOUR_SUPABASE_PUBLISHABLE_KEY
```

Only the publishable key belongs in the game client. Never put a Supabase secret/service-role key in a game build.

## Godot 4 example

Add an HTTPRequest node named `AnnouncementsRequest` to a scene, then attach this script to a UI node. Add a RichTextLabel named `AnnouncementsText`.

```gdscript
extends Control

const SUPABASE_URL = "https://wobrjedahfhleazgvpkp.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY"

@onready var request: HTTPRequest = $AnnouncementsRequest
@onready var output: RichTextLabel = $AnnouncementsText

func _ready():
    request.request_completed.connect(_on_announcements_loaded)
    load_announcements()

func load_announcements():
    var url = SUPABASE_URL + "/rest/v1/announcements?select=id,title,body,created_at&published=eq.true&order=created_at.desc&limit=20"
    var headers = [
        "apikey: " + SUPABASE_PUBLISHABLE_KEY,
        "Authorization: Bearer " + SUPABASE_PUBLISHABLE_KEY
    ]
    var error = request.request(url, headers)
    if error != OK:
        output.text = "Could not connect to announcements."

func _on_announcements_loaded(result, response_code, headers, body):
    if response_code != 200:
        output.text = "Announcements are temporarily unavailable."
        return
    var parsed = JSON.parse_string(body.get_string_from_utf8())
    if typeof(parsed) != TYPE_ARRAY:
        output.text = "Could not read announcements."
        return
    output.clear()
    if parsed.is_empty():
        output.text = "No announcements yet."
        return
    for item in parsed:
        output.append_text("[b]" + str(item.get("title", "")) + "[/b]\n")
        output.append_text(str(item.get("body", "")) + "\n\n")
