import requests

API_URL = "https://yarngpt.ai/api/v1/tts"
API_KEY = "sk_live_lGNd9jerIS-5GHbuiMxAgpk_7jmT2NjDRaHvyFvrw_k"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

payload = {
    "text": """The minivan, once a bubble of road-trip laughter and singalongs, now sat listing slightly into a muddy ditch, a monument to a shortcut that went terribly wrong. For the last two hours, Sarah, Mark, and their two children, ten-year-old Lily and seven-year-old Ben, had been walking along a barely visible track. The air was thin and sharp, carrying the scent of wet pine and distant snow, and the vast, gray-green peaks of the Chugach Mountains loomed around them, silent and indifferent. **Panic** was a cold, constricting band around Sarah's chest. They had left the map back in the van's glove box, presuming a small hike to a supposed vista point would be simple. Now, as the sun began its slow, agonizing drop behind the highest ridges, turning the clouds bruised purple and angry red, the family huddled together, their voices hushed by the sheer scale of the wilderness. Mark tried to project calm, pointing out a small, wind-battered spruce tree in the distance, suggesting they could build a shelter, but his hands, deep in his pockets, were trembling.
    Ben, usually the most rambunctious, was unnervingly quiet, clutching a frayed stuffed dinosaur; it was Lily who finally broke the suffocating silence. "Look, Dad," she whispered, her voice barely audible over the rising wind, pointing with a tiny finger towards a spot where the trees thinned. Nestled in a fold between two massive boulders, a faint, metallic glint caught the last of the fading light—it was a small, corrugated-iron shack, likely a forgotten prospector's cabin. A flicker of **hope**—raw, fragile, and fiercely needed—ignited in the parents' eyes. Mark scooped up Ben and started toward the distant structure, Sarah pulling a weary Lily along, their steps quickened by the promise of four walls and a door, a single, tiny haven against the monumental, unforgiving night that was beginning to descend upon the lost family.""",
}

response = requests.post(API_URL, headers=headers, json=payload, stream=True)

if response.status_code == 200:
    with open("output.mp3", "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print("Audio file saved as output.mp3")
else:
    print(f"Error: {response.status_code}")
    print(response.json())