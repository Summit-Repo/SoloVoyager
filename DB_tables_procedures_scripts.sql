USE [Travel]
GO
/****** Object:  Table [dbo].[Concerns]    Script Date: 01-08-2023 13:28:02 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Concerns](
	[concern_id] [int] IDENTITY(1,1) NOT NULL,
	[post_id] [int] NULL,
	[concern_text] [varchar](200) NULL,
	[isActionTaken] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[concern_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[post_story]    Script Date: 01-08-2023 13:28:02 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[post_story](
	[post_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NULL,
	[place] [varchar](200) NULL,
	[title] [varchar](300) NULL,
	[days] [int] NULL,
	[budget] [numeric](18, 0) NULL,
	[complex_data] [nvarchar](max) NULL,
	[upvote] [int] NULL,
	[isVisible] [bit] NULL,
 CONSTRAINT [PK__post_sto__3ED78766A57FF54B] PRIMARY KEY CLUSTERED 
(
	[post_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[user_votes]    Script Date: 01-08-2023 13:28:02 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[user_votes](
	[post_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
	[vote] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[post_id] ASC,
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[users]    Script Date: 01-08-2023 13:28:02 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[username] [varchar](50) NOT NULL,
	[password] [varchar](1000) NOT NULL,
	[isActive] [bit] NULL,
	[isAdmin] [bit] NULL,
 CONSTRAINT [PK__user__3213E83F59DAF64C] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ__user__F3DBC572A62C6863] UNIQUE NONCLUSTERED 
(
	[username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Concerns] ADD  CONSTRAINT [DF_Concerns_isActiionTaken]  DEFAULT ((0)) FOR [isActionTaken]
GO
ALTER TABLE [dbo].[post_story] ADD  CONSTRAINT [DF_post_story_upvote]  DEFAULT ((0)) FOR [upvote]
GO
ALTER TABLE [dbo].[post_story] ADD  CONSTRAINT [DF_post_story_isVisible]  DEFAULT ((1)) FOR [isVisible]
GO
ALTER TABLE [dbo].[users] ADD  CONSTRAINT [DF_users_isActive]  DEFAULT ((1)) FOR [isActive]
GO
ALTER TABLE [dbo].[users] ADD  CONSTRAINT [DF_users_isAdmin]  DEFAULT ((0)) FOR [isAdmin]
GO
ALTER TABLE [dbo].[Concerns]  WITH CHECK ADD  CONSTRAINT [FK__Concerns__post_i__3D5E1FD2] FOREIGN KEY([post_id])
REFERENCES [dbo].[post_story] ([post_id])
GO
ALTER TABLE [dbo].[Concerns] CHECK CONSTRAINT [FK__Concerns__post_i__3D5E1FD2]
GO
ALTER TABLE [dbo].[user_votes]  WITH CHECK ADD FOREIGN KEY([post_id])
REFERENCES [dbo].[post_story] ([post_id])
GO
ALTER TABLE [dbo].[user_votes]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
/****** Object:  StoredProcedure [dbo].[ActionOnPost]    Script Date: 01-08-2023 13:28:02 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ActionOnPost]
    @userId INT = NULL,
    @postId INT = NULL,
    @concern_id INT = NULL
AS
BEGIN
    BEGIN TRANSACTION;

    BEGIN TRY
        IF @userId IS NOT NULL
        BEGIN
            UPDATE users
            SET isActive = 0
            WHERE id = @userId;
        END

        IF @postId IS NOT NULL AND @concern_id IS NULL
        BEGIN
            UPDATE post_story
            SET isVisible = 0
            WHERE post_id = @postId;

            UPDATE concerns
            SET isActionTaken = 1
            WHERE post_id = @postId;
        END

        IF @postId IS NOT NULL AND @concern_id IS NOT NULL
        BEGIN
            UPDATE concerns
            SET isActionTaken = 1
            WHERE post_id = @postId AND concern_id = @concern_id;
        END

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH;
END
GO
/****** Object:  StoredProcedure [dbo].[GetPostsByBatch]    Script Date: 01-08-2023 13:28:02 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetPostsByBatch]
    @StartIndex INT,
    @BatchSize INT,
    @Place NVARCHAR(200) = NULL,
    @UserId INT = NULL,
    @PostId INT = NULL,
    @Vote_UserId INT = NULL
AS
BEGIN
    SELECT ps.*, u.username, ISNULL(uv.vote, 0) AS user_vote
    FROM (
        SELECT *,
            ROW_NUMBER() OVER (ORDER BY post_id DESC) AS RowNumber
        FROM post_story
        WHERE isVisible = 1
          AND ((@Place IS NULL) OR (place COLLATE SQL_Latin1_General_CP1_CI_AS LIKE '%' + @Place COLLATE SQL_Latin1_General_CP1_CI_AS + '%'))
          AND ((@UserId IS NULL) OR (user_id = @UserId))
          AND ((@PostId IS NULL) OR (post_id = @PostId))
    ) AS ps
    JOIN users u ON ps.user_id = u.id
    LEFT JOIN user_votes uv ON ps.post_id = uv.post_id AND uv.user_id = @Vote_UserId
    WHERE ps.RowNumber BETWEEN @StartIndex AND (@StartIndex + @BatchSize - 1)
    ORDER BY ps.post_id DESC
END
GO
/****** Object:  StoredProcedure [dbo].[UpdateUpvote]    Script Date: 01-08-2023 13:28:02 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateUpvote]
  @p_user_id INT,
  @p_post_id INT
AS
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_votes WHERE user_id = @p_user_id AND post_id = @p_post_id)
  BEGIN
    INSERT INTO user_votes (post_id, user_id, vote)
    VALUES (@p_post_id, @p_user_id, 1);
    
    UPDATE post_story
    SET upvote = upvote + 1
    WHERE post_id = @p_post_id;
  END
  ELSE
  BEGIN
    DECLARE @current_vote INT

    SELECT @current_vote = ISNULL(vote, 0)
    FROM user_votes
    WHERE user_id = @p_user_id AND post_id = @p_post_id;

    IF @current_vote = 1
    BEGIN
      UPDATE user_votes
      SET vote = 0
      WHERE user_id = @p_user_id AND post_id = @p_post_id;
      
      UPDATE post_story
      SET upvote = upvote - 1
      WHERE post_id = @p_post_id;
    END
    ELSE
    BEGIN
      UPDATE user_votes
      SET vote = 1
      WHERE user_id = @p_user_id AND post_id = @p_post_id;
      
      UPDATE post_story
      SET upvote = upvote + 1
      WHERE post_id = @p_post_id;
    END
  END
END;
GO
