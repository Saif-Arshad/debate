const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createDebate = async (req, res) => {
    try {
        const { name, description: discription, sides } = req.body;
        console.log(req.body)
        const userId = req.user.id
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const debate = await prisma.debate.create({
            data: {
                name,
                description: discription,
                userId,
                sides,
            },
        });

        return res.status(201).json({
            success: true,
            data: debate,
        });
    } catch (error) {
        console.log("🚀 ~ exports.createDebate= ~ error:", error)
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDebate = async (req, res) => {
    try {
        const { id } = req.params;

        const debate = await prisma.debate.findUnique({
            where: { id },
            include: {
                user: true, contributions: true, participants: true, raiseHand: {
                    include: {
                        author: true
                    }
                }
            },
        });
        if (!debate) {
            return res.status(404).json({
                success: false,
                message: 'Debate not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: debate,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDebates = async (req, res) => {
    const userId = req.user.id

    try {
        const debates = await prisma.debate.findMany({
            where: {
                userId
            },
            include: { user: true },
        });

        return res.status(200).json({
            success: true,
            data: debates,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDebate = async (req, res) => {

    try {
        const { id } = req.params;
        const { name, discription, sides, participents, status } = req.body;

        const debate = await prisma.debate.update({
            where: { id },
            data: {
                name,
                discription,
                sides,
                participents,
                status,
            },
        });

        return res.status(200).json({
            success: true,
            data: debate,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDebate = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.debateParticipant.deleteMany({
            where: { debateId: id },
        });

        await prisma.contribution.deleteMany({
            where: { debateId: id },
        });

        await prisma.debate.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: 'Debate deleted successfully',
        });
    } catch (error) {
        console.log("🚀 ~ exports.deleteDebate ~ error:", error)
        return res.status(500).json({ success: false, message: error.message });
    }
};


exports.joinDebate = async (req, res) => {
    const debateId = req.params.id;
    const { userName: name, side, Name, firstThought } = req.body;

    console.log("First Thought:", firstThought);
    console.log("Name:", Name);
    console.log("Side:", side);

    // Generate a unique userName using the provided values.
    const userName =
        name +
        side.split(" ").join("") +
        Name.split(" ").join("") +
        firstThought.split(" ").join("") +
        Date.now();

    if (!userName || !side) {
        return res
            .status(400)
            .json({ error: "userName and side are required" });
    }

    try {
        const existing = await prisma.debateParticipant.findFirst({
            where: { debateId, userName, Name },
        });
        if (existing) {
            return res
                .status(400)
                .json({ error: "Username already taken in this debate" });
        }
        // Include Name and firstThought in the data object.
        const participant = await prisma.debateParticipant.create({
            data: { debateId, userName, side, Name, firstThought },
        });
        return res.json(participant);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


exports.contributions = async (req, res) => {
    const debateId = req.params.id;
    const { authorName, authorId, side, content } = req.body;
    if (!authorName || !side || !content) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const contribution = await prisma.contribution.create({
            data: { debateId, authorName, authorId, side, content },
        });
        return res.json(contribution);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.react = async (req, res) => {
    const { contributionId } = req.params;
    const { reaction } = req.body; // Expected: "like" or "dislike"
    if (!reaction || !["like", "dislike"].includes(reaction)) {
        return res.status(400).json({ error: "Invalid reaction" });
    }
    try {
        const contribution = await prisma.contribution.findUnique({
            where: { id: contributionId },
        });
        if (!contribution) {
            return res.status(404).json({ error: "Contribution not found" });
        }
        const updateData =
            reaction === "like"
                ? { likes: contribution.likes + 1 }
                : { dislikes: contribution.dislikes + 1 };
        const updatedContribution = await prisma.contribution.update({
            where: { id: contributionId },
            data: updateData,
        });
        // You can also emit an event via Socket.IO.
        return res.json(updatedContribution);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
