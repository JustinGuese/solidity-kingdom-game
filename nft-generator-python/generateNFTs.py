
from scipy import stats
import pandas as pd

def calculateMultipliers(positionid):
    attack = (positionid + 314) % 100
    defense = (positionid + 72) % 100
    money = (positionid + 39298) % 100

    attackMultiplier = 10
    defenseMultiplier = 10
    moneyMultiplier = 10
    # attack logic
    if attack >= 95:
        attackMultiplier = attackMultiplier + 6 * (attack - 95)
    elif attack >= 80:
        attackMultiplier = attackMultiplier + attack - 80
    elif 20 <= attack and attack < 30:
        attackMultiplier = attackMultiplier + attack - 15
    # defense logic
    if defense >= 95:
        defenseMultiplier = defenseMultiplier + 6 * (defense - 95)
    elif attack >= 80:
        defenseMultiplier = defenseMultiplier + defense - 80
    elif 10 <= defense and defense < 30:
        defenseMultiplier = defenseMultiplier + defense - 5
    # money logic
    if money >= 80:
        moneyMultiplier = moneyMultiplier + money - 80
    else:
        moneyMultiplier = moneyMultiplier + money / 10

    # little fix as solidity doesnt know floats
    attackMultiplier, defenseMultiplier, moneyMultiplier = int(attackMultiplier), int(defenseMultiplier), int(moneyMultiplier)
    # check that they are not zero
    if attackMultiplier < 0:
        attackMultiplier = 0
    if defenseMultiplier < 0:
        defenseMultiplier = 0
    if moneyMultiplier < 0:
        moneyMultiplier = 0

    # we do not want to have zero multipliers
    return (attackMultiplier+1, defenseMultiplier+1, moneyMultiplier+1)


store = []
for i in range(10000):
    attack, defense, money = calculateMultipliers(i)
    # these values actually represent floats, shifting /10 would be the plan to get it
    # print(f"{i} {attack} {defense} {money}")
    store.append([i, attack, defense, money])
df = pd.DataFrame(store, columns = ['positionid', 'attack', 'defense', 'money'])
# df.to_csv('multipliers.csv', index=False)

# the 75th percentile for 
#   attack is: 13
#   defense is: 10
#   money is: 16
# the 25th percentile for 
#  attack is: 10
#  defense is: 10
#  money is: 12
# legendary is:
#  attack is: 34
#  defense is: 34
#  money is: 29

bads = []
normals = []
goods = []
rares = []
legendaries = []

for i in range(len(df)):
    pos, attack, defense, money = df.iloc[i]
    if attack == 35 or defense == 35 or money == 30:
        legendaries.append(pos)
    elif attack >= 11 and defense > 11 and money >= 13:
        rares.append(pos)
    elif attack > 14 or defense > 11 or money > 17:
        goods.append(pos)
    elif attack > 11 or defense > 11 or money > 13:
        normals.append(pos)
    else:
        bads.append(pos)

print(f"legendaries: {len(legendaries)}")
print(f"rares: {len(rares)}")
print(f"goods: {len(goods)}")
print(f"normals: {len(normals)}")
print(f"bads: {len(bads)}")

df["rarity"] = None
df.loc[legendaries, "rarity"] = "legendary"
df.loc[rares, "rarity"] = "rare"
df.loc[goods, "rarity"] = "good"
df.loc[normals, "rarity"] = "normal"
df.loc[bads, "rarity"] = "bad"

# calculate percentiles for each symbol to calculate final rank
df["attack_percentile"] = df["attack"].rank(pct=True)
df["defense_percentile"] = df["defense"].rank(pct=True)
df["money_percentile"] = df["money"].rank(pct=True)
df["total_score"] = df["attack_percentile"] + df["defense_percentile"] + df["money_percentile"]
df["total_score_rank"] = df["total_score"].rank(ascending=False, method = "first")
df.drop(["total_score"], axis=1, inplace=True)

print(df.head())
# fix the decimal
# df["attack"] = df["attack"].apply(lambda x: x / 10)
# df["defense"] = df["defense"].apply(lambda x: x / 10)
# df["money"] = df["money"].apply(lambda x: x / 10)

df.to_csv("multipliers.csv", index=False)
print(df.describe())
# save another one with the best ranked
df = df.sort_values(by=["total_score_rank"])
df.to_csv("multipliers_ranked.csv", index=True)

from PIL import Image

def getAttackImage(value):
    if value == 35:
        return Image.open("assets/lion 5.png")
    elif value >= 14:
        return Image.open("assets/lion 4.png")
    elif value > 11:
        return Image.open("assets/lion 3.png")
    elif value > 9:
        return Image.open("assets/lion 2.png")
    else:
        return Image.open("assets/lion 1.png")

def getDefenseImage(value):
    if value == 35:
        return Image.open("assets/bear 5.png")
    elif value >= 14:
        return Image.open("assets/bear 4.png")
    elif value > 11:
        return Image.open("assets/bear 3.png")
    elif value > 9:
        return Image.open("assets/bear 2.png")
    else:
        return Image.open("assets/bear 1.png")

def getMoneyImage(value):
    if value == 30:
        return Image.open("assets/bull 5.png")
    elif value >= 17:
        return Image.open("assets/bull 4.png")
    elif value > 13:
        return Image.open("assets/bull 3.png")
    elif value > 12:
        return Image.open("assets/bull 2.png")
    else:
        return Image.open("assets/bull 1.png")

# create the images next
for i in range(len(df)):
    row = df.iloc[i]
    # first grab the shield
    if row["rarity"] == "legendary":
        background = Image.open("assets/shield 5.png")
    elif row["rarity"] == "rare":
        background = Image.open("assets/shield 4.png")
    elif row["rarity"] == "good":
        background = Image.open("assets/shield 3.png")
    elif row["rarity"] == "normal":
        background = Image.open("assets/shield 2.png")
    else:
        background = Image.open("assets/shield 1.png")

    # then grab bear = defense, bull = money, lion = attack
    lion = getAttackImage(row["attack"])
    bear = getDefenseImage(row["defense"])
    bull = getMoneyImage(row["money"])

    # now layer them 
    background.paste(lion, (0, 0), lion)
    background.paste(bear, (0, 0), bear)
    background.paste(bull, (0, 0), bull)
    # save it
    background.save(f"output/{i}.png")